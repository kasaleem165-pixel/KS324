import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import pandas as pd
import os

# ── Config ────────────────────────────────────────────────────────────────────
EXCEL_PATH  = "/root/.claude/uploads/c77f4c80-b57f-49de-ae44-26d4292936d9/aa554904-Waccha_Weigh_and_ID_for_Photos.xlsx"
INPUT_DIR   = "/home/user/KS324/animal_images"
OUTPUT_DIR  = "/home/user/KS324/animal_output"
FONT_BOLD   = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_REG    = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
WEIGH_DATE  = "09 May 2026"

# Overlay colours
OVERLAY_BG   = (10, 28, 18, 210)   # deep forest green, semi-transparent
GOLD         = (255, 215, 80)
WHITE        = (255, 255, 255)
LIGHT_GRAY   = (200, 210, 205)
DIVIDER      = (80, 160, 100, 180)


def load_data():
    df = pd.read_excel(EXCEL_PATH, sheet_name="Waccha Weight", header=1)
    df.columns = ["drop", "sno", "code", "weight"]
    df = df.dropna(subset=["code"])
    df["code"]   = df["code"].astype(int)
    df["weight"] = df["weight"].round().astype(int)
    return {int(row["code"]): int(row["weight"]) for _, row in df.iterrows()}


def remove_old_text(img_bgr):
    """
    Detect and inpaint the casual text boxes:
      - Pure-red weight box (hue 0-10 or 170-180, high saturation)
      - Pure-black code box (all channels < 40, upper 55% of image)
      - Pure-white weight box (all channels > 230)
    """
    h, w = img_bgr.shape[:2]
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    b, g, r = img_bgr[:,:,0], img_bgr[:,:,1], img_bgr[:,:,2]

    # — Red boxes —
    red1 = cv2.inRange(hsv, np.array([0, 180, 120]),   np.array([10, 255, 255]))
    red2 = cv2.inRange(hsv, np.array([168, 180, 120]), np.array([180, 255, 255]))
    red_mask = cv2.bitwise_or(red1, red2)

    # — White boxes (bright, low-saturation) —
    white_mask = np.all(img_bgr > 220, axis=2).astype(np.uint8) * 255
    # keep only large connected white blobs (text box sized)
    white_mask = _filter_blobs(white_mask, min_area=1500)

    # — Black boxes in upper 55% only (avoid dark animals at bottom) —
    dark_mask_raw = np.all(img_bgr < 35, axis=2).astype(np.uint8) * 255
    region_mask = np.zeros((h, w), np.uint8)
    region_mask[:int(h * 0.55), :] = 255
    black_mask = cv2.bitwise_and(dark_mask_raw, region_mask)
    black_mask = _filter_blobs(black_mask, min_area=400)

    # — Yellow floating text (hue 20-35, high sat/val) in upper 78% —
    yellow_raw = cv2.inRange(hsv, np.array([18, 160, 160]), np.array([38, 255, 255]))
    upper_mask = np.zeros((h, w), np.uint8)
    upper_mask[:int(h * 0.78), :] = 255
    yellow_mask = cv2.bitwise_and(yellow_raw, upper_mask)
    yellow_mask = _filter_blobs(yellow_mask, min_area=200)

    combined = cv2.bitwise_or(red_mask,
               cv2.bitwise_or(white_mask,
               cv2.bitwise_or(black_mask, yellow_mask)))

    # Dilate to fully cover text pixels
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (14, 14))
    combined = cv2.dilate(combined, kernel, iterations=1)

    if combined.max() == 0:
        return img_bgr  # nothing to remove

    inpainted = cv2.inpaint(img_bgr, combined, inpaintRadius=7, flags=cv2.INPAINT_TELEA)
    return inpainted


def _filter_blobs(mask, min_area=400):
    """Keep only blobs larger than min_area pixels."""
    num, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    clean = np.zeros_like(mask)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            clean[labels == i] = 255
    return clean


def draw_overlay(pil_img, code, weight):
    """Draw an elegant semi-transparent overlay at the bottom."""
    img = pil_img.convert("RGBA")
    iw, ih = img.size
    bar_h = max(int(ih * 0.22), 90)   # overlay height ~22% of image

    # ── Opaque base: fully cover any old text in the bottom zone ─────────────
    base = Image.new("RGBA", (iw, ih), (0, 0, 0, 0))
    base_draw = ImageDraw.Draw(base)
    base_draw.rectangle([(0, ih - bar_h), (iw, ih)],
                        fill=(OVERLAY_BG[0], OVERLAY_BG[1], OVERLAY_BG[2], 255))
    img = Image.alpha_composite(img, base)

    # ── Build gradient overlay layer ─────────────────────────────────────────
    overlay = Image.new("RGBA", (iw, bar_h), (0, 0, 0, 0))
    draw    = ImageDraw.Draw(overlay)

    # Gradient: slightly lighter toward bottom
    for i in range(bar_h):
        alpha = int(200 * (0.5 + 0.5 * i / bar_h))
        r = OVERLAY_BG[0] + int(10 * i / bar_h)
        g_ = OVERLAY_BG[1] + int(15 * i / bar_h)
        b_ = OVERLAY_BG[2] + int(10 * i / bar_h)
        draw.line([(0, i), (iw, i)], fill=(r, g_, b_, alpha))

    # Thin gold top border line
    draw.line([(0, 0), (iw, 0)], fill=(*GOLD, 255), width=3)

    # Vertical gold divider in the centre
    cx = iw // 2
    draw.line([(cx, 12), (cx, bar_h - 12)], fill=(*GOLD[:3], 160), width=2)

    # ── Fonts ────────────────────────────────────────────────────────────────
    label_sz = max(int(bar_h * 0.22), 14)
    value_sz = max(int(bar_h * 0.48), 30)
    date_sz  = max(int(bar_h * 0.18), 12)
    try:
        f_label = ImageFont.truetype(FONT_REG,  label_sz)
        f_value = ImageFont.truetype(FONT_BOLD, value_sz)
        f_date  = ImageFont.truetype(FONT_REG,  date_sz)
    except Exception:
        f_label = f_value = f_date = ImageFont.load_default()

    # ── Layout: reserve bottom strip for date ────────────────────────────────
    date_strip_h = date_sz + 10
    content_h    = bar_h - date_strip_h
    left_cx      = cx // 2
    right_cx     = cx + cx // 2
    top_y        = int(content_h * 0.12)

    # ── Left panel — Code ────────────────────────────────────────────────────
    draw.text((left_cx, top_y), "ANIMAL CODE",
              font=f_label, fill=(*LIGHT_GRAY, 220), anchor="mt")
    draw.text((left_cx, top_y + label_sz + 4), str(code),
              font=f_value, fill=(*GOLD, 255), anchor="mt")

    # ── Right panel — Weight ─────────────────────────────────────────────────
    draw.text((right_cx, top_y), "LIVE WEIGHT",
              font=f_label, fill=(*LIGHT_GRAY, 220), anchor="mt")
    draw.text((right_cx, top_y + label_sz + 4), f"{int(weight)} Kg",
              font=f_value, fill=(*WHITE, 255), anchor="mt")

    # ── Date — bottom centre strip ───────────────────────────────────────────
    draw.text((cx, bar_h - 6), f"Weighed:  {WEIGH_DATE}",
              font=f_date, fill=(*LIGHT_GRAY, 180), anchor="mb")

    # ── Paste overlay onto image ─────────────────────────────────────────────
    img.paste(overlay, (0, ih - bar_h), overlay)
    return img.convert("RGB")


def process_image(code, weight, test_only=False):
    src = os.path.join(INPUT_DIR, f"{code}.jpg")
    if not os.path.exists(src):
        print(f"  [SKIP] {code}.jpg not found")
        return None

    img_bgr = cv2.imread(src)
    cleaned = remove_old_text(img_bgr)

    pil_img = Image.fromarray(cv2.cvtColor(cleaned, cv2.COLOR_BGR2RGB))
    result  = draw_overlay(pil_img, code, weight)
    return result


def main(test_code=None):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    data = load_data()
    print(f"Loaded {len(data)} records from Excel\n")

    codes = [test_code] if test_code else sorted(data.keys())

    for code in codes:
        weight = data[code]
        print(f"  Processing {code}.jpg  (weight: {weight} Kg) ...", end=" ")
        result = process_image(code, weight)
        if result:
            out_path = os.path.join(OUTPUT_DIR, f"{code}.jpg")
            result.save(out_path, quality=95)
            print("done")
        else:
            print("skipped")

    print(f"\nAll done. Output saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    import sys
    test_code = int(sys.argv[1]) if len(sys.argv) > 1 else None
    main(test_code)
