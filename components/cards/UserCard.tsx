"use client";

import { Edit2, Trash2, Power, PowerOff } from "lucide-react";
import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  role?: string;
  roles?: Array<{ id: number; name: string }>;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-600",
  ANIMATEUR: "bg-[#F0A93E]/10 text-[#F0A93E]",
  AUDITEUR: "bg-blue-500/10 text-blue-600",
};

export default function UserCard({
  user,
  onEdit,
  onDelete,
  onToggleActive,
}: UserCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  const getRoleName = () => {
    if (user.role) return user.role;
    if (user.roles && user.roles.length > 0) return user.roles[0].name;
    return "N/A";
  };

  const roleName = getRoleName();
  const roleColor = roleColors[roleName] || "bg-[#163A2C]/10 text-[#163A2C]";

  return (
    <div
      className="group rounded-xl overflow-hidden bg-white border border-[#163A2C]/10 shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#163A2C]/10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-[#0E241C] line-clamp-1">{user.name}</h3>
            <p className="text-sm text-[#163A2C]/60 line-clamp-1">{user.email}</p>
            {user.phone && (
              <p className="text-sm text-[#163A2C]/60 line-clamp-1">{user.phone}</p>
            )}
          </div>

          {/* Role Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColor}`}>
            {roleName}
          </div>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {user.is_active ? (
            <div className="flex items-center gap-1 text-xs text-[#1E9D55] font-semibold">
              <div className="w-2 h-2 rounded-full bg-[#1E9D55]" />
              Actif
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-[#163A2C]/60 font-semibold">
              <div className="w-2 h-2 rounded-full bg-[#163A2C]/60" />
              Inactif
            </div>
          )}
        </div>

        {isHovering && (
          <div className="flex gap-2">
            <button
              onClick={() => onToggleActive(user.id)}
              className={`p-2 rounded-lg transition-colors ${
                user.is_active
                  ? "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                  : "bg-[#1E9D55]/10 text-[#1E9D55] hover:bg-[#1E9D55]/20"
              }`}
              title={user.is_active ? "Désactiver" : "Activer"}
            >
              {user.is_active ? <PowerOff size={16} /> : <Power size={16} />}
            </button>
            <button
              onClick={() => onEdit(user)}
              className="p-2 rounded-lg bg-[#F0A93E]/10 text-[#F0A93E] hover:bg-[#F0A93E]/20 transition-colors"
              title="Modifier"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(user.id)}
              className="p-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
