import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  License
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-neutral-600">
            © 2026 Cal.com. All rights reserved. Our mission is to connect a
            billion people by 2031 through calendar scheduling.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-neutral-600 hover:text-neutral-900">
              <span className="text-sm">Twitter</span>
            </Link>
            <Link href="#" className="text-neutral-600 hover:text-neutral-900">
              <span className="text-sm">GitHub</span>
            </Link>
            <Link href="#" className="text-neutral-600 hover:text-neutral-900">
              <span className="text-sm">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
