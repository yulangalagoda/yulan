'use client';
import { useEffect } from 'react';
import type { AgentContact, AgentProfile, AgentProject } from '@/lib/agent-content';

interface WebMCPProps {
  profile: AgentProfile;
  projects: AgentProject[];
  contact: AgentContact;
}

/**
 * Exposes site tools to AI agents via the WebMCP API
 * (navigator.modelContext.provideContext).
 * Renders nothing — purely a side-effect component. All payloads are derived
 * from the Notion site data at build time and passed in as props.
 */
export default function WebMCP({ profile, projects, contact }: WebMCPProps) {
  useEffect(() => {
    const nav = navigator as any;
    if (typeof nav?.modelContext?.provideContext !== 'function') return;

    nav.modelContext.provideContext({
      tools: [
        {
          name: 'get_profile',
          description: `Get professional profile information about ${profile.name}.`,
          inputSchema: { type: 'object', properties: {}, required: [] },
          execute: async () => profile,
        },
        {
          name: 'get_projects',
          description: `Get a list of key projects and research by ${profile.name}.`,
          inputSchema: { type: 'object', properties: {}, required: [] },
          execute: async () => projects,
        },
        {
          name: 'get_contact',
          description: `Get contact and collaboration information for ${profile.name}.`,
          inputSchema: { type: 'object', properties: {}, required: [] },
          execute: async () => contact,
        },
      ],
    });
  }, [profile, projects, contact]);

  return null;
}
