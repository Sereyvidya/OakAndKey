export default function QrCode({ src, className }) {
  if (!src) return null;
  return <img src={src} alt="QR code" className={className} />;
}
