import { Icon, type IconName } from "./ui";

export default function ComingSoon({ title, desc, icon }: { title: string; desc: string; icon: IconName }) {
  return (
    <div className="app-empty-page">
      <span className="app-empty-ico"><Icon name={icon} size={22} /></span>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className="app-tag tone-amber">Segera hadir</span>
    </div>
  );
}