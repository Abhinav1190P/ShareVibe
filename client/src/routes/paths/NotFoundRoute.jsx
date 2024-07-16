import BaseLayout from "../../components/layouts/base/index";
import PublicGuard from "../../routes/PublicGaurd";
import NotFound from "../../pages/404";
import Unauthorized from "../../pages/Unauthorized";

const NotFoundRoutes = {
  element: (
    <PublicGuard>
      <BaseLayout />
    </PublicGuard>
  ),
  children: [
    {
      path: "*",
      element: <NotFound />,
    },
    {
      path: "/unauthorized",
      element: <Unauthorized />,
    },
  ],
};

export default NotFoundRoutes;