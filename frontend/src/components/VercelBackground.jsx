export default function VercelBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#05060a]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_20%),radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.10),transparent_22%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.04),transparent_18%)]" />

      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(circle at center, black 30%, transparent 85%)",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.12),rgba(0,0,0,0.32),rgba(0,0,0,0.52))]" />
    </div>
  );
}