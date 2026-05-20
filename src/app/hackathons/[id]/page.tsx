"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import {
  Trophy,
  Calendar,
  Users,
  Plus,
  X,
  UserPlus,
  Search as SearchIcon,
  Trash2,
  ChevronDown,
  Loader2,
} from "lucide-react";

interface TeamMember {
  id: string;
  role: string;
  country: string | null;
  user: { id: string; fullName: string; avatarUrl: string | null; batch: string | null };
}

interface Requirement {
  id: string;
  skillNeeded: string;
  countryPreferred: string | null;
  spotsAvailable: number;
}

interface Team {
  id: string;
  teamName: string;
  description: string | null;
  isFull: boolean;
  createdBy: string;
  members: TeamMember[];
  requirements: Requirement[];
}

interface Hackathon {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  maxTeamSize: number;
  creator: { id: string; fullName: string };
  teams: Team[];
}

const COUNTRY_FLAGS: Record<string, string> = {
  India: "\u{1F1EE}\u{1F1F3}",
  "United States": "\u{1F1FA}\u{1F1F8}",
  "United Kingdom": "\u{1F1EC}\u{1F1E7}",
  Canada: "\u{1F1E8}\u{1F1E6}",
  Australia: "\u{1F1E6}\u{1F1FA}",
  Germany: "\u{1F1E9}\u{1F1EA}",
  France: "\u{1F1EB}\u{1F1F7}",
  Japan: "\u{1F1EF}\u{1F1F5}",
  Singapore: "\u{1F1F8}\u{1F1EC}",
  UAE: "\u{1F1E6}\u{1F1EA}",
  Brazil: "\u{1F1E7}\u{1F1F7}",
  Spain: "\u{1F1EA}\u{1F1F8}",
  Italy: "\u{1F1EE}\u{1F1F9}",
  Netherlands: "\u{1F1F3}\u{1F1F1}",
  China: "\u{1F1E8}\u{1F1F3}",
  "South Korea": "\u{1F1F0}\u{1F1F7}",
  Mexico: "\u{1F1F2}\u{1F1FD}",
  Nigeria: "\u{1F1F3}\u{1F1EC}",
  Kenya: "\u{1F1F0}\u{1F1EA}",
  "South Africa": "\u{1F1FF}\u{1F1E6}",
};

const COUNTRIES = Object.keys(COUNTRY_FLAGS);

function getFlag(country: string | null): string {
  if (!country) return "\u{1F30D}";
  return COUNTRY_FLAGS[country] || "\u{1F30D}";
}

export default function HackathonDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const hackathonId = params.id as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState<string | null>(null); // teamId

  // Create team form
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [myRole, setMyRole] = useState("");
  const [myCountry, setMyCountry] = useState("");
  const [requirements, setRequirements] = useState<{ skillNeeded: string; countryPreferred: string }[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newCountryPref, setNewCountryPref] = useState("");
  const [creating, setCreating] = useState(false);

  // Join form
  const [joinRole, setJoinRole] = useState("");
  const [joinCountry, setJoinCountry] = useState("");
  const [joining, setJoining] = useState(false);

  // Add member
  const [showAddMember, setShowAddMember] = useState<string | null>(null); // teamId
  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; fullName: string; avatarUrl: string | null; batch: string | null; expertise: string | null }[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; fullName: string } | null>(null);
  const [addRole, setAddRole] = useState("");
  const [addCountry, setAddCountry] = useState("");
  const [adding, setAdding] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const fetchHackathon = useCallback(() => {
    fetch(`/api/hackathons/${hackathonId}`)
      .then((r) => r.json())
      .then((d) => setHackathon(d.hackathon))
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [hackathonId]);

  useEffect(() => {
    fetchHackathon();
  }, [fetchHackathon]);

  // Search users for add member — must be before early returns to satisfy hook rules
  const searchUsers = useCallback((query: string, currentHackathon: Hackathon | null) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    fetch(`/api/users?search=${encodeURIComponent(query.trim())}`)
      .then((r) => r.json())
      .then((d) => {
        // Filter out users already in a team for this hackathon
        const teamUserIds = new Set(
          currentHackathon?.teams.flatMap((t) => t.members.map((m) => m.user.id)) || []
        );
        const filtered = (d.users || []).filter(
          (u: { id: string }) => !teamUserIds.has(u.id)
        );
        setSearchResults(filtered);
      })
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, []);

  if (loading || !user || loadingData) {
    return (
      <div className="min-h-screen bg-tetr-gray-light">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-tetr-gray-light">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-gray-900">Hackathon not found</h2>
        </div>
      </div>
    );
  }

  const now = new Date();
  const isActive = new Date(hackathon.endDate) >= now;
  const isLive = new Date(hackathon.startDate) <= now && new Date(hackathon.endDate) >= now;

  // Check if current user is already in a team
  const userTeam = hackathon.teams.find((t) =>
    t.members.some((m) => m.user.id === user.id)
  );

  const addRequirement = () => {
    if (!newSkill.trim()) return;
    setRequirements([...requirements, { skillNeeded: newSkill.trim(), countryPreferred: newCountryPref }]);
    setNewSkill("");
    setNewCountryPref("");
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleCreateTeam = async () => {
    setError("");
    if (!teamName.trim() || !myRole.trim()) {
      setError("Team name and your role are required.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          description: teamDesc.trim() || null,
          role: myRole.trim(),
          country: myCountry || null,
          requirements: requirements.map((r) => ({
            skillNeeded: r.skillNeeded,
            countryPreferred: r.countryPreferred || null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create team.");
      } else {
        setShowCreateTeam(false);
        setTeamName("");
        setTeamDesc("");
        setMyRole("");
        setMyCountry("");
        setRequirements([]);
        fetchHackathon();
      }
    } catch {
      setError("Something went wrong.");
    }
    setCreating(false);
  };

  const handleJoinTeam = async (teamId: string) => {
    setError("");
    if (!joinRole.trim()) {
      setError("Your role is required.");
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/teams/${teamId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: joinRole.trim(),
          country: joinCountry || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to join team.");
      } else {
        setShowJoinModal(null);
        setJoinRole("");
        setJoinCountry("");
        fetchHackathon();
      }
    } catch {
      setError("Something went wrong.");
    }
    setJoining(false);
  };

  const handleSearchChange = (value: string) => {
    setMemberSearch(value);
    setSelectedUser(null);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchUsers(value, hackathon), 300);
  };

  const handleAddMember = async (teamId: string) => {
    setError("");
    if (!selectedUser) {
      setError("Please select a user to add.");
      return;
    }
    if (!addRole.trim()) {
      setError("Role is required for the new member.");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/teams/${teamId}/add-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: addRole.trim(),
          country: addCountry || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add member.");
      } else {
        setShowAddMember(null);
        setSelectedUser(null);
        setMemberSearch("");
        setAddRole("");
        setAddCountry("");
        setSearchResults([]);
        fetchHackathon();
      }
    } catch {
      setError("Something went wrong.");
    }
    setAdding(false);
  };

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Hackathon Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-tetr-green" />
                <h1 className="text-2xl font-bold text-gray-900">{hackathon.title}</h1>
              </div>
              {isLive && (
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 bg-green-100 text-green-700 rounded-full mb-2">
                  Live Now
                </span>
              )}
              {!isActive && (
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full mb-2">
                  Ended
                </span>
              )}
              {hackathon.description && (
                <p className="text-sm text-gray-600 mt-2 max-w-2xl">{hackathon.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(hackathon.startDate)} — {formatDate(hackathon.endDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Max {hackathon.maxTeamSize} per team
                </span>
                <span>{hackathon.teams.length} team{hackathon.teams.length !== 1 ? "s" : ""} registered</span>
              </div>
            </div>

            {isActive && !userTeam && (
              <button
                onClick={() => setShowCreateTeam(true)}
                className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                Create a Team
              </button>
            )}
          </div>

          {userTeam && (
            <div className="mt-4 p-3 bg-tetr-green-bg rounded-lg border border-tetr-green/20">
              <p className="text-sm text-tetr-green font-medium">
                You&apos;re in team &ldquo;{userTeam.teamName}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Teams Section */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2" id="teams">
            <Users className="w-5 h-5 text-tetr-green" />
            Teams ({hackathon.teams.length})
          </h2>
        </div>

        {hackathon.teams.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">No teams yet</h3>
            <p className="text-sm text-gray-500">Be the first to create a team!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hackathon.teams.map((team) => {
              const spotsLeft = hackathon.maxTeamSize - team.members.length;
              const isMyTeam = team.members.some((m) => m.user.id === user.id);

              return (
                <div
                  key={team.id}
                  className={`card p-5 ${isMyTeam ? "ring-2 ring-tetr-green/30" : ""}`}
                >
                  {/* Team header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.teamName}</h3>
                      {team.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{team.description}</p>
                      )}
                    </div>
                    {team.isFull ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 bg-red-100 text-red-600 rounded-full shrink-0">
                        Full
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 bg-green-100 text-green-700 rounded-full shrink-0">
                        {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} open
                      </span>
                    )}
                  </div>

                  {/* Members */}
                  <div className="space-y-2 mb-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Members</p>
                    {team.members.map((m) => (
                      <div key={m.id} className="flex items-center gap-2">
                        <Avatar name={m.user.fullName} avatarUrl={m.user.avatarUrl} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getFlag(m.country)} {m.user.fullName}
                            {m.user.id === team.createdBy && (
                              <span className="text-[10px] text-tetr-green ml-1">(Lead)</span>
                            )}
                          </p>
                          <p className="text-[11px] text-gray-500">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Requirements */}
                  {team.requirements.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-1">Looking for</p>
                      <div className="flex flex-wrap gap-1.5">
                        {team.requirements.map((r) => (
                          <span
                            key={r.id}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200"
                          >
                            <SearchIcon className="w-3 h-3" />
                            {r.skillNeeded}
                            {r.countryPreferred && ` ${getFlag(r.countryPreferred)}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-3 space-y-2">
                    {/* Join button — visible to users NOT in any team */}
                    {isActive && !userTeam && !team.isFull && (
                      <button
                        onClick={() => {
                          setShowJoinModal(team.id);
                          setError("");
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-tetr-green bg-tetr-green-bg hover:bg-tetr-green/10 rounded-lg transition-colors border border-tetr-green/20"
                      >
                        <UserPlus className="w-4 h-4" />
                        Join Team
                      </button>
                    )}

                    {/* Add Member button — visible to team lead when team is NOT full */}
                    {isActive && isMyTeam && team.createdBy === user.id && !team.isFull && (
                      <button
                        onClick={() => {
                          setShowAddMember(team.id);
                          setError("");
                          setSelectedUser(null);
                          setMemberSearch("");
                          setAddRole("");
                          setAddCountry("");
                          setSearchResults([]);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                      >
                        <Plus className="w-4 h-4" />
                        Add Member
                      </button>
                    )}

                    {isMyTeam && (
                      <div className="text-center text-xs text-tetr-green font-medium">
                        Your team
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Create a Team</h3>
              <button onClick={() => setShowCreateTeam(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. The Innovators"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Description</label>
                <textarea
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Brief description of your team's focus..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Role *</label>
                  <input
                    type="text"
                    value={myRole}
                    onChange={(e) => setMyRole(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Frontend Dev"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Country</label>
                  <select
                    value={myCountry}
                    onChange={(e) => setMyCountry(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {getFlag(c)} {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Looking for teammates</label>
                {requirements.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {requirements.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm flex-1">
                          {r.skillNeeded}
                          {r.countryPreferred && (
                            <span className="text-gray-400 ml-1">({getFlag(r.countryPreferred)} {r.countryPreferred})</span>
                          )}
                        </span>
                        <button onClick={() => removeRequirement(i)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Skill needed (e.g. UI Designer)"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                  />
                  <select
                    value={newCountryPref}
                    onChange={(e) => setNewCountryPref(e.target.value)}
                    className="input-field w-36"
                  >
                    <option value="">Any country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {getFlag(c)} {c}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

              <button
                onClick={handleCreateTeam}
                disabled={creating}
                className="btn-primary w-full py-2.5 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Team"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Join Team</h3>
              <button onClick={() => setShowJoinModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Role *</label>
                <input
                  type="text"
                  value={joinRole}
                  onChange={(e) => setJoinRole(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Backend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Country</label>
                <select
                  value={joinCountry}
                  onChange={(e) => setJoinCountry(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {getFlag(c)} {c}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

              <button
                onClick={() => handleJoinTeam(showJoinModal)}
                disabled={joining}
                className="btn-primary w-full py-2.5 disabled:opacity-50"
              >
                {joining ? "Joining..." : "Join Team"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Add Member to Team</h3>
              <button
                onClick={() => {
                  setShowAddMember(null);
                  setSelectedUser(null);
                  setMemberSearch("");
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search for user */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Student *</label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="input-field pl-9"
                    placeholder="Type a name to search..."
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Search results dropdown */}
                {memberSearch.trim().length >= 2 && !selectedUser && (
                  <div className="mt-1 border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white shadow-sm">
                    {searching ? (
                      <div className="px-3 py-4 text-center text-sm text-gray-400">
                        Searching...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm text-gray-400">
                        No students found
                      </div>
                    ) : (
                      searchResults.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setSelectedUser({ id: u.id, fullName: u.fullName });
                            setMemberSearch(u.fullName);
                            setSearchResults([]);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                        >
                          <Avatar name={u.fullName} avatarUrl={u.avatarUrl} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{u.fullName}</p>
                            <p className="text-[11px] text-gray-500">{u.batch}{u.expertise ? ` · ${u.expertise}` : ""}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Selected user tag */}
                {selectedUser && (
                  <div className="mt-2 flex items-center gap-2 bg-tetr-green-bg border border-tetr-green/20 rounded-lg px-3 py-2">
                    <UserPlus className="w-4 h-4 text-tetr-green shrink-0" />
                    <span className="text-sm font-medium text-gray-900 flex-1">{selectedUser.fullName}</span>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setMemberSearch("");
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Role for new member */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Their Role *</label>
                <input
                  type="text"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="input-field"
                  placeholder="e.g. UI Designer, Backend Dev"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Their Country</label>
                <select
                  value={addCountry}
                  onChange={(e) => setAddCountry(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {getFlag(c)} {c}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

              <button
                onClick={() => handleAddMember(showAddMember)}
                disabled={adding || !selectedUser}
                className="btn-primary w-full py-2.5 disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add to Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
