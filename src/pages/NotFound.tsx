import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 data-page-motion="title" className="mb-4 text-4xl font-bold">404</h1>
        <p data-page-motion="lead" className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a data-page-motion="actions" href="/" className="cursor-target text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
