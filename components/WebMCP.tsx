'use client';
import { useEffect } from 'react';

/**
 * Exposes site tools to AI agents via the WebMCP API
 * (navigator.modelContext.provideContext).
 * Renders nothing — purely a side-effect component.
 */
export default function WebMCP() {
  useEffect(() => {
    const nav = navigator as any;
    if (typeof nav?.modelContext?.provideContext !== 'function') return;

    nav.modelContext.provideContext({
      tools: [
        {
          name: 'get_profile',
          description:
            'Get professional profile information about Yulan Galagoda — cybersecurity engineer and AI researcher.',
          inputSchema: { type: 'object', properties: {}, required: [] },
          execute: async () => ({
            name: 'Yulan Galagoda',
            title: 'Cybersecurity Engineer & AI Researcher',
            location: 'Plymouth, United Kingdom',
            education: [
              'BSc Computer Security, First Class — University of Plymouth (2024)',
              'MSc Artificial Intelligence, in progress — University of Plymouth',
            ],
            specialisation:
              'Intrusion detection systems for connected vehicles, adversarial machine learning, CAN bus security',
            availability:
              'Open to research collaborations and consultations in IoV security, adversarial ML, and IDS evaluation.',
            contact: 'https://yulan.me/#contact',
          }),
        },
        {
          name: 'get_projects',
          description: 'Get a list of key projects and research by Yulan Galagoda.',
          inputSchema: { type: 'object', properties: {}, required: [] },
          execute: async () => [
            {
              name: 'AdverSec',
              tagline: 'Hardening neural IDS against FGSM and PGD attacks on the CAN bus.',
              type: 'Research',
              status: 'In Progress',
              year: 2025,
              technologies: ['Python', 'PyTorch', 'scikit-learn', 'Adversarial Robustness Toolbox', 'CICIoV2024'],
            },
            {
              name: 'NetEAGLE',
              tagline: 'Raspberry Pi network security gateway with mobile control plane.',
              type: 'Academic',
              status: 'Completed',
              year: 2024,
              technologies: ['Python', 'Flask', 'Raspberry Pi', 'Linux', 'Nmap', 'UFW', 'Suricata'],
            },
            {
              name: 'The Meridian',
              tagline: 'Living archive of antiques, books, and historical objects.',
              type: 'Personal',
              status: 'Published',
              year: 2025,
            },
            {
              name: 'Rampe',
              tagline: 'Sri Lankan and global recipes, documented properly.',
              type: 'Personal',
              status: 'Published',
              year: 2025,
              url: 'https://rampe.pages.dev',
            },
          ],
        },
        {
          name: 'get_contact',
          description: 'Get contact and collaboration information for Yulan Galagoda.',
          inputSchema: { type: 'object', properties: {}, required: [] },
          execute: async () => ({
            contact_url: 'https://yulan.me/#contact',
            availability:
              'Open to research collaborations and consultations in IoV security, adversarial ML, and IDS evaluation.',
            note: 'Please use the contact form at the URL above to get in touch.',
          }),
        },
      ],
    });
  }, []);

  return null;
}
