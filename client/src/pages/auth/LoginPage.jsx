// client/src/pages/auth/LoginPage.jsx
// Static shell only — no real submit logic until the auth endpoint exists.

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold text-gray-900">FARAS Login</h1>
        <label className="mb-1 block text-sm text-gray-600" htmlFor="itsNumber">
          ITS Number
        </label>
        <input
          id="itsNumber"
          type="text"
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
          placeholder="8-digit ITS Number"
        />
        <label className="mb-1 block text-sm text-gray-600" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="w-full rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
        >
          Log In
        </button>
      </form>
    </div>
  );
}