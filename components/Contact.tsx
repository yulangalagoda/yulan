import CanvasCANBus from './CanvasCANBus';
import type { ProfileRow } from '@/lib/types';

interface Props {
  contact?: ProfileRow;
  email?: string;
}

export default function Contact({ contact, email }: Props) {
  const title = contact?.headline?.trim() || 'Open to research collaborations, security engineering roles, and good conversations.';
  const sub = contact?.content?.trim() || 'Based in Plymouth, United Kingdom. Replies usually within a day. For everything else (projects, writing, antiques, recipes), email is best.';
  const addr = email || 'yulangalagoda1@gmail.com';

  return (
    <section id="contact" data-tone="dark">
      <CanvasCANBus id="contact-canvas" className="contact__bg" opacityScale={0.6} />
      <div className="container">
        <div className="contact__inner reveal">
          <span className="contact__eyebrow">Contact</span>
          <h2 className="contact__title">{title}</h2>
          <a href={`mailto:${addr}`} className="contact__email">{addr}</a>
          <p className="contact__sub">{sub}</p>
        </div>
      </div>
    </section>
  );
}
