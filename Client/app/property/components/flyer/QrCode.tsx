export default function QrCode({
  src,
  className,
}: {
  src?: string;
  className?: string;
}) {
  if (!src) return null;
  return <img src={src} alt="QR code" className={className} />;
}
