interface TrustBadgeProps {
  icon: string;
  label: string;
}

export default function TrustBadge({ icon, label }: TrustBadgeProps) {
  return (
    <div className="flex flex-col items-center space-y-3 group cursor-default">
      <div className="w-16 h-16 bg-gradient-to-br from-[#f4d03f]/20 to-[#2d5016]/10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-gradient-to-br group-hover:from-[#f4d03f]/30 group-hover:to-[#2d5016]/20">
        <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{icon}</span>
      </div>
      <span className="text-sm font-semibold text-gray-700 text-center group-hover:text-[#2d5016] transition-colors">{label}</span>
    </div>
  );
}

