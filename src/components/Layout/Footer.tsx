export function Footer() {
  return (
    <footer>
      <div className="container mx-auto">
        <p className="mt-2">
          © {new Date().getFullYear()} | Made with ❤️ by Player 222 (<a href="https://explorer.roninchain.com/address/walnut.ron" className="contract-link">walnut.ron</a>)
        </p>
        <p>
          As of May 21, 2025, this is no longer maintained. Feel free to fork/clone this repo and host it on your own.
        </p>
      </div>
    </footer>
  );
}
