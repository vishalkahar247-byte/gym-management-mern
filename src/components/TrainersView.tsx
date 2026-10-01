import React, { useState } from 'react';
import { Plus, Award, Star, Phone, Mail, Users, X, Dumbbell } from 'lucide-react';
import { ITrainer, IMember } from '../types/index.ts';
import { api } from '../api/client.ts';

interface TrainersViewProps {
  trainers: ITrainer[];
  members: IMember[];
  onRefresh: () => void;
  onSelectMember: (memberId: string) => void;
}

export const TrainersView: React.FC<TrainersViewProps> = ({
  trainers,
  members,
  onRefresh,
  onSelectMember,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experienceYears, setExperienceYears] = useState('4');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createTrainer({
        name,
        specialty,
        phone,
        email,
        experienceYears: Number(experienceYears),
        bio,
      });
      setModalOpen(false);
      setName('');
      setSpecialty('');
      setPhone('');
      setEmail('');
      setBio('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add coach');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Coaches & Training Staff</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Certified personal trainers, movement specialists, and client caseloads.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Coach</span>
        </button>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trainers.map(trainer => {
          const assignedMembers = members.filter(m => m.trainerId === trainer._id);
          return (
            <div
              key={trainer._id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* Header with Avatar Initial */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${trainer.avatarColor} text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0`}
                  >
                    {trainer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{trainer.name}</h3>
                    <div className="text-xs text-orange-600 font-medium">{trainer.specialty}</div>
                  </div>
                </div>

                {/* Rating & Experience */}
                <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs">
                  <div className="flex items-center gap-1 text-slate-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold font-mono-nums">{trainer.rating.toFixed(2)}</span>
                  </div>
                  <div className="text-slate-500 font-mono-nums">
                    <span>{trainer.experienceYears} Years Exp</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700 font-mono-nums">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{assignedMembers.length} clients</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {trainer.bio || 'Dedicated fitness professional coaching athletes toward strength milestones.'}
                </p>

                {/* Contact */}
                <div className="space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono-nums">{trainer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{trainer.email}</span>
                  </div>
                </div>

                {/* Assigned Members Section */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Assigned Athletes:
                  </div>
                  {assignedMembers.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No members currently assigned</div>
                  ) : (
                    <div className="space-y-1">
                      {assignedMembers.slice(0, 3).map(m => (
                        <button
                          key={m._id}
                          type="button"
                          onClick={() => onSelectMember(m._id)}
                          className="w-full text-left text-xs text-slate-700 hover:text-orange-600 truncate flex items-center justify-between py-0.5"
                        >
                          <span className="truncate">{m.fullName}</span>
                          <span className="text-[10px] text-slate-400 font-mono-nums">{m.memberCode}</span>
                        </button>
                      ))}
                      {assignedMembers.length > 3 && (
                        <div className="text-[11px] text-slate-400">
                          +{assignedMembers.length - 3} more athletes
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Trainer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">Add New Personal Trainer</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrainer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialty</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Strength & Conditioning, CrossFit, Mobility"
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min={1}
                    value={experienceYears}
                    onChange={e => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="coach@apexiron.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio & Credentials</label>
                <textarea
                  rows={3}
                  placeholder="Certifications, athletic background, training philosophy..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
                >
                  {saving ? 'Adding...' : 'Add Coach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
