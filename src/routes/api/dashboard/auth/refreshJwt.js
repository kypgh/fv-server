import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import { sign } from "jsonwebtoken";
import refreshTokenService from "services/refreshToken.service";
import crmUsersService from "services/crmUsers.service";
import { SECRET2 } from "config/envs";
import HTTPError from "utils/HTTPError";

const router = new AdvancedRouter();

router.POST(
  new AdvancedHandler({
    body: tsv.object({
      refreshToken: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { refreshToken } = req.body;

    let rfToken = await refreshTokenService.findTokenDashboard(refreshToken);
    if (rfToken === null) {
      throw new HTTPError("refresh token is invalid", 403);
    }

    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const timeDiffInMs = now.getTime() - rfToken.createdAt.getTime();

    if (timeDiffInMs >= twoDaysInMs) {
      res.status(401).json({ message: "your session has expired" });
    } else {
      let user = await crmUsersService.findByIdCrmUser(
        rfToken.crmUser?._id || rfToken.crmUser
      );

      if (!user) {
        throw new HTTPError(
          "Something went wrong finding user from refresh token",
          500
        );
      }

      delete user.permissions;

      const jwtToken = sign(
        user,
        SECRET2,
        { expiresIn: "10m" } //TODO: change to 10m
      );
      res.status(200).json({ message: "new jwt token created", jwtToken });
    }
  })
);

export default router;
