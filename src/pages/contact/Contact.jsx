import React from 'react';
import website_name from '@/src/config/website.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faGithub, faInstagram, faSnapchat } from "@fortawesome/free-brands-svg-icons";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

function Contact() {
  return (
    <div className="max-w-4xl mx-auto pt-16 pb-8">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
      <div className="space-y-8 text-white/60">
        <p>
          Get in touch with the {website_name} team (Solo) through any of the following platforms:
        </p>
        <div className="flex flex-wrap gap-6">
          <a
            href="https://t.me/Nishal_k"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="text-xl text-white/60 group-hover:text-white" />
            <span className="text-white/60 group-hover:text-white">Message on Telegram</span>
          </a>
          <a
            href="https://discord.gg/qrzdHN8mu2"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <FontAwesomeIcon icon={faDiscord} className="text-xl text-white/60 group-hover:text-white" />
            <span className="text-white/60 group-hover:text-white">Join Discord Server</span>
          </a>
          <a
            href="https://www.instagram.com/demonking.___?igsh=MXI4NXhmeXFrY3ViaQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <FontAwesomeIcon icon={faInstagram} className="text-xl text-white/60 group-hover:text-white" />
            <span className="text-white/60 group-hover:text-white">Follow on Instagram</span>
          </a>
          <a
            href="https://www.snapchat.com/add/nis77hal?share_id=xvjkMDHhhKA&locale=en-IN"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <FontAwesomeIcon icon={faSnapchat} className="text-xl text-white/60 group-hover:text-white" />
            <span className="text-white/60 group-hover:text-white">Add on Snapchat</span>
          </a>
          <a
            href="https://github.com/nishal21/otazumi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <FontAwesomeIcon icon={faGithub} className="text-xl text-white/60 group-hover:text-white" />
            <span className="text-white/60 group-hover:text-white">GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Contact; 