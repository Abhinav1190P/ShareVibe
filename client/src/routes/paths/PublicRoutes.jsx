import BaseLayout from "../../components/layouts/base/index";
import PublicGuard from "../../routes/PublicGaurd";
import Login from "../../pages/auth/Login";
import Signup from "../../pages/auth/Signup";

const PublicRoutes = {
  element: (
    <PublicGuard>
      <BaseLayout />
    </PublicGuard>
  ),
  children: [
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "signup",
      element: (
        <PublicGuard>
          <Signup />
        </PublicGuard>
      ),
    },
  ],
};

export default PublicRoutes;