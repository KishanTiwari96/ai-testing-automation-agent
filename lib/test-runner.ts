import { chromium, Browser, Page } from "playwright-core";
import { createBrowserbaseSession } from "./browserbase";

export type LogEntry = {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
};

export type ExecutionResult = {
  status: "passed" | "failed";
  duration: number;
  logs: LogEntry[];
  screenshotUrl?: string | null;
  browserbaseSessionId?: string | null;
  liveUrl?: string | null;
  errorMessage?: string | null;
};

async function launchLocalBrowser(): Promise<Browser> {
  const launchOptions = [
    { channel: "chrome", headless: true },
    { channel: "msedge", headless: true },
    { headless: true },
  ];

  let lastError: any = null;
  for (const opts of launchOptions) {
    try {
      return await chromium.launch(opts);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("Failed to launch local browser instance.");
}

export async function executeTestCase(
  testCase: {
    id: number;
    name: string;
    type?: string | null;
    targetUrl: string | null;
    steps?: string[] | string;
    script: string;
  },
  baseUrl: string = "http://localhost:3000"
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const logs: LogEntry[] = [];

  const addLog = (level: LogEntry["level"], message: string) => {
    const timeStr = new Date().toISOString().substring(11, 23);
    logs.push({ timestamp: timeStr, level, message });
  };

  addLog("info", `[Playwright] Initializing test execution: "${testCase.name}"`);
  addLog("info", `[Agent] Target Base URL: ${baseUrl}`);

  // Resolve full target URL
  let fullUrl = baseUrl;
  if (testCase.targetUrl) {
    if (
      testCase.targetUrl.startsWith("http://") ||
      testCase.targetUrl.startsWith("https://") ||
      testCase.targetUrl.startsWith("data:") ||
      testCase.targetUrl.startsWith("file:")
    ) {
      fullUrl = testCase.targetUrl;
    } else {
      fullUrl = `${baseUrl.replace(/\/$/, "")}/${testCase.targetUrl.replace(/^\//, "")}`;
    }
  }

  // Parse steps
  let steps: string[] = [];
  if (Array.isArray(testCase.steps)) {
    steps = testCase.steps;
  } else if (typeof testCase.steps === "string") {
    try {
      steps = JSON.parse(testCase.steps);
    } catch {
      steps = [testCase.steps];
    }
  }

  let session: any = null;
  let browser: Browser | null = null;
  let page: Page | null = null;
  let screenshotBase64: string | null = null;

  try {
    session = await createBrowserbaseSession();

    if (session && session.connectUrl) {
      addLog("info", `[Browserbase] Connecting to cloud browser session ID: ${session.id}...`);
      browser = await chromium.connectOverCDP(session.connectUrl);
    } else {
      addLog("info", `[Local Runner] Launching headless browser engine on host machine...`);
      browser = await launchLocalBrowser();
    }

    const context = browser.contexts()[0] || (await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 AI-Testing-Agent",
    }));

    page = await context.newPage();

    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on("pageerror", (err) => {
      const msg = `[Browser Exception] ${err.message}`;
      pageErrors.push(err.message);
      addLog("error", msg);
    });

    page.on("console", (msg) => {
      const text = msg.text();
      const type = msg.type();
      if (type === "error") {
        consoleErrors.push(text);
        addLog("error", `[Console Error] ${text}`);
      } else if (type === "warning") {
        addLog("warn", `[Console Warning] ${text}`);
      }
    });

    // Track network API failures
    const failedApiRequests: string[] = [];

    page.on("response", (res) => {
      const status = res.status();
      const url = res.url();
      if (status >= 400 && !url.includes("favicon.ico") && !url.includes(".map")) {
        const msg = `[HTTP ${status}] Network request failed for: ${url}`;
        addLog(status >= 500 ? "error" : "warn", msg);
        if (
          url.includes("/api/") ||
          url.includes("/products") ||
          url.includes("/categories") ||
          url.includes(".workers.dev") ||
          status >= 500
        ) {
          failedApiRequests.push(`HTTP ${status} on ${url}`);
        }
      }
    });

    // Navigate to target URL
    addLog("info", `[Navigation] Navigating to: ${fullUrl}`);
    const navResponse = await page.goto(fullUrl, {
      timeout: 25000,
      waitUntil: "domcontentloaded",
    });

    const httpStatus = navResponse?.status() || 200;
    if (httpStatus >= 400) {
      throw new Error(`Target page returned HTTP status ${httpStatus}: ${navResponse?.statusText() || "Request failed"}`);
    }
    addLog("info", `[Navigation] Page loaded successfully (HTTP ${httpStatus})`);

    // Give dynamic client hydration a brief moment
    await page.waitForTimeout(1000);

    const initialUrl = page.url();

    // Log planned steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      addLog("info", `[Step ${i + 1}/${steps.length}] ${step}`);
    }

    const testType = (testCase.type || "").toUpperCase();
    const testNameLower = testCase.name.toLowerCase();
    const stepsText = steps.join(" ").toLowerCase();
    const isAuthOrFormTest =
      testType === "AUTH" ||
      testType === "FORM" ||
      testNameLower.includes("signup") ||
      testNameLower.includes("sign up") ||
      testNameLower.includes("login") ||
      testNameLower.includes("register") ||
      testNameLower.includes("auth") ||
      stepsText.includes("signup") ||
      stepsText.includes("login") ||
      stepsText.includes("register") ||
      stepsText.includes("input") ||
      stepsText.includes("form");

    if (isAuthOrFormTest) {
      addLog("info", `[Auth/Form Agent] Inspecting form inputs and interactive triggers...`);

      // 1. Fill in Name input if present
      const nameInput = page.locator('input[name*="name" i], input[placeholder*="name" i], input[id*="name" i]').first();
      if ((await nameInput.count()) > 0 && (await nameInput.isVisible())) {
        await nameInput.fill("Automated Test User");
        addLog("info", `✓ Filled name field with 'Automated Test User'`);
      }

      // 2. Fill in Email input if present
      const emailInput = page.locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]').first();
      if ((await emailInput.count()) > 0 && (await emailInput.isVisible())) {
        const dummyEmail = `testuser_${Date.now()}@example.com`;
        await emailInput.fill(dummyEmail);
        addLog("info", `✓ Filled email field with '${dummyEmail}'`);
      }

      // 3. Fill in Password inputs if present
      const passwordInputs = page.locator('input[type="password"]');
      const passCount = await passwordInputs.count();
      for (let p = 0; p < passCount; p++) {
        const pInput = passwordInputs.nth(p);
        if (await pInput.isVisible()) {
          await pInput.fill("StrongTestPass123!");
          addLog("info", `✓ Filled password field #${p + 1}`);
        }
      }

      // 4. Check Terms checkbox if present
      const checkbox = page.locator('input[type="checkbox"]').first();
      if ((await checkbox.count()) > 0 && (await checkbox.isVisible())) {
        await checkbox.check();
        addLog("info", `✓ Checked terms & conditions agreement`);
      }

      // 5. Find and click submit / create account button
      const submitBtn = page.locator(
        'button[type="submit"], button:has-text("Create Account"), button:has-text("Sign up"), button:has-text("Sign in"), button:has-text("Login"), button:has-text("Register")'
      ).first();

      if ((await submitBtn.count()) > 0 && (await submitBtn.isVisible())) {
        const btnText = (await submitBtn.textContent())?.trim() || "Submit";
        addLog("info", `[Action] Triggering form action button: "${btnText}"`);
        await submitBtn.click();
        
        // Wait for page state update, network response, or redirection
        addLog("info", `[Assertion] Awaiting authentication response and page transition...`);
        await page.waitForTimeout(3000);
      } else {
        addLog("warn", `[Notice] No direct submit button identified on target page.`);
      }

      // 6. Check for Error Alerts, Toasts, or Error Text anywhere on screen
      const errorSelectors = [
        '[role="alert"]',
        '.toast',
        '[data-sonner-toast]',
        '.text-red-500',
        '.text-rose-500',
        '.text-red-600',
        '.bg-red-500',
        '.bg-rose-500',
        '.error-message',
        '.alert-danger',
        '.alert-destructive',
        '.Toastify__toast--error',
      ];

      for (const sel of errorSelectors) {
        const errorElements = page.locator(sel);
        const count = await errorElements.count();
        for (let j = 0; j < count; j++) {
          const el = errorElements.nth(j);
          if (await el.isVisible()) {
            const errorText = (await el.textContent())?.trim();
            if (
              errorText &&
              (errorText.toLowerCase().includes("failed") ||
                errorText.toLowerCase().includes("error") ||
                errorText.toLowerCase().includes("invalid") ||
                errorText.toLowerCase().includes("server") ||
                errorText.toLowerCase().includes("unable") ||
                errorText.toLowerCase().includes("already exists"))
            ) {
              const shot = await page.screenshot({ fullPage: false });
              screenshotBase64 = `data:image/png;base64,${shot.toString("base64")}`;

              addLog("error", `[Assertion Failure] Detected on-screen error banner: "${errorText}"`);
              throw new Error(`Authentication/Form failed with on-screen error: "${errorText}"`);
            }
          }
        }
      }

      // 7. CRITICAL AUTH VALIDATION: Check if form submission actually succeeded
      // In a signup or login flow, submitting valid credentials MUST either:
      // a) Redirect away from the form (e.g. to dashboard/home/login)
      // b) OR show a success banner / welcome / logged-in state
      // If password inputs are STILL visible and URL did not change and no success message appeared, the signup failed!
      const finalUrl = page.url();
      const stillHasPasswordInputs =
        (await page.locator('input[type="password"]').count()) > 0 &&
        (await page.locator('input[type="password"]').first().isVisible());

      const urlNavigatedAway =
        finalUrl !== initialUrl &&
        !finalUrl.toLowerCase().includes("signup") &&
        !finalUrl.toLowerCase().includes("register");

      const hasSuccessState = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return (
          text.includes("account created") ||
          text.includes("welcome") ||
          text.includes("registration successful") ||
          text.includes("verification email") ||
          text.includes("logout") ||
          text.includes("my account") ||
          text.includes("sign out")
        );
      });

      if (stillHasPasswordInputs && !urlNavigatedAway && !hasSuccessState) {
        const shot = await page.screenshot({ fullPage: false });
        screenshotBase64 = `data:image/png;base64,${shot.toString("base64")}`;

        addLog("error", `[Assertion Failure] Form was submitted, but application remained stuck on "${finalUrl}" without redirecting or authenticating user.`);
        throw new Error(
          `Signup failed: Form was submitted with test credentials, but user was not redirected or logged in (still stuck on "${finalUrl}" with inputs visible). Backend auth handler did not process the registration.`
        );
      } else {
        addLog("success", `✓ Authentication successful: User transitioned to "${finalUrl}"`);
      }
    } else {
      // General UI, Navigation, Category, and Catalog Assertions
      const body = page.locator("body");
      if (!(await body.isVisible())) {
        throw new Error("Page body element is not rendered or invisible");
      }

      const headings = page.locator("h1, h2, header, main");
      const headingCount = await headings.count();
      if (headingCount > 0) {
        addLog("info", `✓ Confirmed primary page headings and content are visible (${headingCount} elements)`);
      }

      const buttons = page.locator("button, a[href]");
      const btnCount = await buttons.count();
      addLog("info", `✓ Verified ${btnCount} interactive elements detected on DOM`);

      // 8. CATEGORY / PRODUCT CATALOG ASSERTIONS:
      // If the target route is a category, search, shop, or product list page
      const isCategoryOrProductPage =
        fullUrl.toLowerCase().includes("/category") ||
        fullUrl.toLowerCase().includes("/product") ||
        fullUrl.toLowerCase().includes("/shop") ||
        fullUrl.toLowerCase().includes("/search") ||
        testNameLower.includes("category") ||
        testNameLower.includes("product") ||
        testNameLower.includes("catalog") ||
        stepsText.includes("product") ||
        stepsText.includes("category");

      if (isCategoryOrProductPage) {
        addLog("info", `[Catalog Agent] Inspecting product grid and listing items for "${fullUrl}"...`);

        // Wait a moment for dynamic client-side API fetches to complete
        await page.waitForTimeout(3000);

        // Check if critical backend API requests failed (HTTP 500 or worker crash)
        if (failedApiRequests.length > 0) {
          const shot = await page.screenshot({ fullPage: false });
          screenshotBase64 = `data:image/png;base64,${shot.toString("base64")}`;
          const errDetail = failedApiRequests[0];
          addLog("error", `[Assertion Failure] Backend product API request failed: ${errDetail}`);
          throw new Error(`Category API failure: Product data request failed on server (${errDetail}).`);
        }

        // Check if console reported critical fetch error
        const criticalConsoleError = consoleErrors.find(
          (e) =>
            e.toLowerCase().includes("error fetching") ||
            e.toLowerCase().includes("failed to load resource") ||
            e.toLowerCase().includes("status of 500") ||
            e.toLowerCase().includes("status of 404")
        );

        if (criticalConsoleError) {
          const shot = await page.screenshot({ fullPage: false });
          screenshotBase64 = `data:image/png;base64,${shot.toString("base64")}`;
          addLog("error", `[Assertion Failure] Critical runtime fetch error: ${criticalConsoleError}`);
          throw new Error(`Category load failure: ${criticalConsoleError}`);
        }

        // Look for genuine product cards strictly outside the sidebar filter container
        const realProductCards = await page.evaluate(() => {
          // Exclude any element inside sidebar, filters, header, or nav
          const isInsideSidebarOrNav = (el: Element | null): boolean => {
            while (el && el !== document.body) {
              const tag = el.tagName.toLowerCase();
              const cls = el.className && typeof el.className === "string" ? el.className.toLowerCase() : "";
              if (
                tag === "aside" ||
                tag === "nav" ||
                tag === "header" ||
                tag === "footer" ||
                cls.includes("sidebar") ||
                cls.includes("filter")
              ) {
                return true;
              }
              el = el.parentElement;
            }
            return false;
          };

          const candidateSelectors = [
            '[data-testid*="product"]',
            '.product-card',
            '.product-item',
            'article',
            'a[href*="/product/"]',
            'a[href*="/item/"]',
            '[class*="ProductCard"]',
            'main [class*="grid"] > div',
            'main [class*="flex"] > div',
          ];

          let realCount = 0;
          for (const sel of candidateSelectors) {
            const elements = document.querySelectorAll(sel);
            for (const el of Array.from(elements)) {
              const htmlEl = el as HTMLElement;
              if (isInsideSidebarOrNav(htmlEl)) continue;

              const text = htmlEl.innerText?.trim() || "";
              const hasImg = htmlEl.querySelector("img") !== null;
              const isSkeleton =
                htmlEl.classList.contains("skeleton") ||
                htmlEl.classList.contains("animate-pulse") ||
                (typeof htmlEl.className === "string" && htmlEl.className.includes("skeleton")) ||
                htmlEl.getAttribute("aria-busy") === "true";

              // Must not be sidebar text
              const isFilterText =
                text.includes("Price Range") ||
                text.includes("All Brands") ||
                text.includes("In Stock Only") ||
                text.includes("Filters");

              if (isSkeleton || isFilterText) continue;

              const hasPriceOrText =
                text.length > 3 &&
                (text.includes("₹") ||
                  text.includes("$") ||
                  text.includes("Rs") ||
                  hasImg);

              if (hasPriceOrText) {
                realCount++;
              }
            }
            if (realCount > 0) break;
          }
          return realCount;
        });

        const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
        const hasExplicitEmptyState =
          pageText.includes("no products found") ||
          pageText.includes("no items found") ||
          pageText.includes("no results") ||
          pageText.includes("out of stock");

        if (realProductCards > 0) {
          addLog("success", `✓ Catalog assertion passed: Detected ${realProductCards} loaded product card(s) with valid pricing & titles.`);
        } else if (hasExplicitEmptyState) {
          addLog("info", `[Notice] Category returned explicit empty state ("No products found").`);
        } else {
          const shot = await page.screenshot({ fullPage: false });
          screenshotBase64 = `data:image/png;base64,${shot.toString("base64")}`;

          const reason = `Category route "${fullUrl}" loaded, but 0 real product items were displayed in the main catalog view (empty/blank result area).`;
          addLog("error", `[Assertion Failure] ${reason}`);
          throw new Error(`Catalog verification failed: ${reason}`);
        }
      }
    }

    if (pageErrors.length > 0) {
      throw new Error(`Uncaught runtime exception on page: ${pageErrors[0]}`);
    }

    const shot = await page.screenshot({ fullPage: false });
    screenshotBase64 = `data:image/png;base64,${shot.toString("base64")}`;

    await browser.close();
    browser = null;

    const duration = Date.now() - startTime;
    addLog("success", `[Agent] Test execution PASSED in ${(duration / 1000).toFixed(2)}s!`);

    return {
      status: "passed",
      duration,
      logs,
      screenshotUrl: screenshotBase64,
      browserbaseSessionId: session?.id || null,
      liveUrl: session?.id ? `https://www.browserbase.com/sessions/${session.id}` : null,
      errorMessage: null,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const failureReason = error.message || "Test execution failed";
    addLog("error", `[Failure] ${failureReason}`);

    if (page && !screenshotBase64) {
      try {
        const shot = await page.screenshot({ fullPage: false });
        screenshotBase64 = `data:image/png;base64,${shot.toString("base64")}`;
      } catch {}
    }

    if (browser) {
      try {
        await browser.close();
      } catch {}
    }

    return {
      status: "failed",
      duration,
      logs,
      screenshotUrl: screenshotBase64,
      browserbaseSessionId: session?.id || null,
      liveUrl: session?.id ? `https://www.browserbase.com/sessions/${session.id}` : null,
      errorMessage: failureReason,
    };
  }
}
