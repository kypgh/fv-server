import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";

const router = new AdvancedRouter();

router.GET(
  new AdvancedHandler().route((req, res) => {
    res.status(200).json({ message: "Server is live and running" });
  })
);

export default router;
