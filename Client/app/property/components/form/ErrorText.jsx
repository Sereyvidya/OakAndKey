export default function ErrorText({ children }) {
  if (!children) return null;
  return <p className="form-error-text mt-1 text-sm">{children}</p>;
}
