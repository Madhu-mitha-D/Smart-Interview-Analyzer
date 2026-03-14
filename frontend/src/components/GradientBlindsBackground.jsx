import GradientBlinds from "./GradientBlinds";

export default function GradientBlindsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#040406]" />

      <div className="absolute inset-0">
        <GradientBlinds
          gradientColors={["#ff9ffc", "#5227ff"]}
          angle={-12}
          noise={0.32}
          blindCount={18}
          blindMinWidth={56}
          spotlightRadius={0.45}
          spotlightSoftness={1}
          spotlightOpacity={1.15}
          mouseDampening={0.15}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.24))]" />
    </div>
  );
}