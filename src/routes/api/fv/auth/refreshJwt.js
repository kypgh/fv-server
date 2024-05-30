import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import { sign } from "jsonwebtoken";
import refreshTokenService from "services/refreshToken.service";
import usersService from "services/users.service";
import { SECRET } from "config/envs";

const router = new AdvancedRouter();

router.POST(
  new AdvancedHandler({
    body: tsv.object({
      refreshToken: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { refreshToken } = req.body;
    let rfToken = await refreshTokenService.findToken(refreshToken);
    if (!rfToken) {
      res.status(401).json({ message: "invalid refresh token" });
      return;
    }
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const timeDiffInMs = now.getTime() - rfToken.createdAt.getTime();

    if (timeDiffInMs >= twoDaysInMs) {
      res.status(401).json({ message: "your session has expired" });
    } else {
      let user = await usersService.findById(rfToken.user.toString());

      const jwtToken = sign(
        user.toJSON(), //valid for 30 seconds
        SECRET,
        { expiresIn: "10m" }
      );
      res.status(200).json({ message: "new jwt token created", jwtToken });
    }
  })
);

export default router;
