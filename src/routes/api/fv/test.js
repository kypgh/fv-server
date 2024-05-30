import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";

const router = new AdvancedRouter();

router.GET(
  new AdvancedHandler({}).route((req, res) => {
    res.status(200).json({ message: "test" });
    //throw new Error("test error");
  })
);

export default router;
