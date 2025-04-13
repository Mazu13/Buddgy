"use client";

export default function MembersPanel() {
  const members = [
    { name: "Member 1", avatar: "/images/avatar1.png" },
    { name: "Member 2", avatar: "/images/avatar2.png" },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Members</h3>
      <ul className="space-y-3">
        {members.map((member, index) => (
          <li
            key={index}
            className="flex items-center gap-3 p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm"
          >
            <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
            <span className="text-sm">{member.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
