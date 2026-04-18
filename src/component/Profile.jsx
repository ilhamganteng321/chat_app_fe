const Profile = ({ user, onClose }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header dengan tombol close */}
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Profile Saya</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Konten profile - lebar & nyaman */}
      <div className="max-w-3xl mx-auto p-8">
        <div className="space-y-8">
          {/* Avatar besar */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-4xl font-bold">
              {user?.data.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Informasi */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nama Lengkap
              </label>
              <p className="text-gray-900 text-lg">{user?.data.name || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Alamat Email
              </label>
              <p className="text-gray-900 text-lg">{user?.data.email || "-"}</p>
            </div>

            {/* Tambah field lain */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Bergabung Sejak
              </label>
              <p className="text-gray-900 text-lg">
                {new Date(user?.data.created_at).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
