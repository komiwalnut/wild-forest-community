export function Footer() {
  return (
    <footer>
      <div className="container mx-auto">
        <p className="mt-2">
          © {new Date().getFullYear()} | Made with ❤️ by Player 222 (<a href="https://explorer.roninchain.com/address/walnut.ron" className="contract-link">walnut.ron</a>)
        </p>
      </div>
    </footer>
  );
}
