export default function Footer() {
    return (
      <footer className="w-full py-6 bg-gray-100 mt-10">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          © {new Date().getFullYear()} MySite. All rights reserved.
        </div>
      </footer>
    );
  }
  