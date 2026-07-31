from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    print("Navigating to http://localhost:3000/compare/stripe-vs-paypal with 120s timeout...")
    page.goto("http://localhost:3000/compare/stripe-vs-paypal", timeout=120000)
    print("Page loaded. Waiting for hydration...")
    page.wait_for_timeout(10000)

    # Scroll down slightly to see the rating cards and overview
    print("Scrolling down slightly...")
    page.mouse.wheel(0, 450)
    page.wait_for_timeout(2000)

    # Take screenshot at the key moment
    os.makedirs("./verification/screenshots", exist_ok=True)
    screenshot_path = "./verification/screenshots/stripe-vs-paypal_hero.png"
    page.screenshot(path=screenshot_path)
    print(f"Screenshot taken: {screenshot_path}")
    page.wait_for_timeout(2000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        os.makedirs("./verification/videos", exist_ok=True)
        context = browser.new_context(
            record_video_dir="./verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
