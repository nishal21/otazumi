import { useEffect } from "react";
import logoTitle from "@/src/config/logoTitle.js";
import website_name from "@/src/config/website.js";
import { Link } from "react-router-dom";
import PWAInstallButton from "@/src/components/pwa-install/PWAInstallButton";

function Footer() {
  // Load DMCA badge script after component mounts
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://images.dmca.com/Badges/DMCABadgeHelper.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <footer className="w-full mt-16">
      {/* Logo Section */}
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex justify-center sm:justify-between items-center gap-6 flex-wrap">
          <img
            src="/footer.svg"
            alt={logoTitle}
            className="h-[100px] w-[200px] object-contain"
          />
          {/* PWA Install Button */}
          <div className="flex items-center">
            <PWAInstallButton />
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-[1920px] mx-auto px-4 py-6">
          {/* A-Z List Section */}
          <div className="mb-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 items-center sm:items-start">
              <h2 className="text-sm font-medium text-white">A-Z LIST</h2>
              <span className="text-sm text-white/60">Browse anime alphabetically</span>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {["All", "#", "0-9", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))].map((item, index) => (
                <Link
                  to={`az-list/${item === "All" ? "" : item}`}
                  key={index}
                  className="px-2.5 py-1 text-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="flex gap-4 flex-wrap justify-center sm:justify-start mt-4">
              <Link
                to="/terms-of-service"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/code-of-conduct"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Code of Conduct
              </Link>
              <Link
                to="/dmca"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                DMCA
              </Link>
              <Link
                to="/faq"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                FAQ
              </Link>
              <Link
                to="/subtitle-download"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Subtitles
              </Link>
              <Link
                to="/contact"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/games"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              >
                🎮 Games
              </Link>
              <Link
                to="/support"
                className="text-sm text-pink-400 hover:text-pink-300 transition-colors font-semibold"
              >
                ❤️ Support Developer
              </Link>
            </div>
            
            {/* Support Links */}
            <div className="flex gap-4 flex-wrap justify-center sm:justify-start mt-4 pt-4 border-t border-white/5">
              {/* DMCA Badge */}
              <a
                href="//www.dmca.com/Protection/Status.aspx?ID=f45f82d3-f541-4754-a9a8-a4983ee5e643&refurl=https://otazumi.page/"
                title="DMCA.com Protection Status"
                className="dmca-badge"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://images.dmca.com/Badges/DMCA_logo-grn-btn150w.png?ID=f45f82d3-f541-4754-a9a8-a4983ee5e643"
                  alt="DMCA.com Protection Status"
                  style={{ width: "120px", height: "auto", maxWidth: "100%" }}
                />
              </a>
            </div>
          </div>

          {/* Legal Text */}
          <div className="space-y-2 text-sm text-white/40 text-center sm:text-left">
            <p className="max-w-4xl mx-auto sm:mx-0">
              {website_name} does not host any files, it merely pulls streams from
              3rd party services. Legal issues should be taken up with the file
              hosts and providers. {website_name} is not responsible for any media
              files shown by the video providers.
            </p>
            <p>© {website_name}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
