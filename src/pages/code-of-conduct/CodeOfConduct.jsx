import React from 'react';
import website_name from '@/src/config/website.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

function CodeOfConduct() {
  return (
    <div className="max-w-5xl mx-auto pt-16 pb-5">
      {/* Content */}
      <div className="space-y-12 text-white/60">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white">Code of Conduct</h1>
          <p className="mt-2 text-lg">Our pledge to maintain a positive community</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Our Pledge</h2>
          <p className="leading-relaxed text-base">
            We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, caste, color, religion, or sexual identity and orientation.
          </p>
          <p className="mt-3 leading-relaxed text-base">
            We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Our Standards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">✅ Examples of acceptable behavior:</h3>
              <ul className="space-y-2">
                {[
                  "Demonstrating empathy and kindness toward other people",
                  "Being respectful of differing opinions, viewpoints, and experiences",
                  "Giving and gracefully accepting constructive feedback",
                  "Accepting responsibility and apologizing to those affected by our mistakes, and learning from the experience",
                  "Focusing on what is best not just for us as individuals, but for the entire community"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span className="leading-relaxed text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-3">❌ Examples of unacceptable behavior:</h3>
              <ul className="space-y-2">
                {[
                  "The use of sexualized language or imagery, and sexual attention or advances of any kind",
                  "Trolling, insulting or derogatory comments, and personal or political attacks",
                  "Public or private harassment",
                  "Publishing others' private information, such as a physical or email address, without their explicit permission",
                  "Other conduct which could reasonably be considered inappropriate in a professional setting"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span className="leading-relaxed text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Enforcement Responsibilities</h2>
          <p className="leading-relaxed text-base">
            Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.
          </p>
          <p className="mt-3 leading-relaxed text-base">
            Community leaders have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, and will communicate reasons for moderation decisions when appropriate.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Scope</h2>
          <p className="leading-relaxed text-base">
            This Code of Conduct applies within all community spaces, and also applies when an individual is officially representing the community in public spaces. Examples of representing our community include using an official email address, posting via an official social media account, or acting as an appointed representative at an online or offline event.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Reporting Violations</h2>
          <p className="leading-relaxed text-base">
            Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders responsible for enforcement. All complaints will be reviewed and investigated promptly and fairly.
          </p>
          <p className="mt-3 leading-relaxed text-base">
            All community leaders are obligated to respect the privacy and security of the reporter of any incident.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Enforcement Guidelines</h2>
          <div className="space-y-4">
            {[
              {
                level: "1. Correction",
                impact: "Use of inappropriate language or other behavior deemed unprofessional or unwelcome in the community.",
                consequence: "A private, written warning from community leaders, providing clarity around the nature of the violation and an explanation of why the behavior was inappropriate. A public apology may be requested."
              },
              {
                level: "2. Warning",
                impact: "A violation through a single incident or series of actions.",
                consequence: "A warning with consequences for continued behavior. No interaction with the people involved, including unsolicited interaction with those enforcing the Code of Conduct, for a specified period of time."
              },
              {
                level: "3. Temporary Ban",
                impact: "A serious violation of community standards, including sustained inappropriate behavior.",
                consequence: "A temporary ban from any sort of interaction or public communication with the community for a specified period of time."
              },
              {
                level: "4. Permanent Ban",
                impact: "Demonating a pattern of violation of community standards, including sustained inappropriate behavior, harassment of an individual, or aggression toward or disparagement of classes of individuals.",
                consequence: "A permanent ban from any sort of public interaction within the community."
              }
            ].map((guideline, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">{guideline.level}</h3>
                <p className="text-sm text-white/80 mb-2"><strong>Community Impact:</strong> {guideline.impact}</p>
                <p className="text-sm"><strong>Consequence:</strong> {guideline.consequence}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
          <p className="leading-relaxed text-base">
            If you have questions about this Code of Conduct or need to report a violation, please contact us at:{' '}
            <a
              href="mailto:nishalamv@gmail.com"
              className="text-white hover:text-white/80 underline underline-offset-4 decoration-white/20 hover:decoration-white/40 transition-colors"
            >
              nishalamv@gmail.com
            </a>
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Attribution</h2>
          <p className="leading-relaxed text-base">
            This Code of Conduct is adapted from the <a href="https://www.contributor-covenant.org" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 underline">Contributor Covenant</a>, version 2.1, available at{' '}
            <a href="https://www.contributor-covenant.org/version/2/1/code_of_conduct.html" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 underline">
              https://www.contributor-covenant.org/version/2/1/code_of_conduct.html
            </a>.
          </p>
          <p className="mt-3 leading-relaxed text-base">
            Community Impact Guidelines were inspired by <a href="https://github.com/mozilla/diversity" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 underline">Mozilla's code of conduct enforcement ladder</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CodeOfConduct;