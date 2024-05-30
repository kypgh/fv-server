import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import { SECRET2 } from "config/envs";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import crmUsersService from "services/crmUsers.service";
import refreshTokenService from "services/refreshToken.service";
import randomToken from "random-token";
import crmUserPermissions from "models/crmUserPermissions";

const router = new AdvancedRouter();

router.POST(
  new AdvancedHandler({
    body: tsv.object({
      email: tsv.string(),
      password: tsv.string(),
    }),
  }).route(async (req, res) => {
    let secret = SECRET2;
    const { email, password } = req.body;

    let user = await crmUsersService.findCrmUser(email);

    if (!user) {
      res.status(404).json({ message: "User does not exist!" });
      return;
    }

    let userPermissions = await crmUserPermissions.findOne({
      crmUser: user,
    });

    if (userPermissions?.isSuspened) {
      res.status(403).json({ message: "user is suspended" });
      return;
    }
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const jwtToken = sign(
        user.toJSON(), //valid for 30 seconds
        secret,
        { expiresIn: "10m" } //TODO: change to 10m
      );

      let rfToken = await refreshTokenService.checkIfTokenExistsDashbaord(user);

      if (rfToken) {
        await refreshTokenService.removeTokenDashboard(rfToken);
      }

      let newRefreshToken = randomToken(16) + user._id.toString();

      let refTokenBody = {
        token: newRefreshToken,
        crmUser: user,
      };

      let refreshToken = await refreshTokenService.createRefreshTokenDashboard(
        refTokenBody
      );

      let response = { jwt: jwtToken, refreshToken: refreshToken.token };

      res.status(200).json({ message: response });
      return;
    }

    res.status(401).json({ message: "passwords do not match" });
  })
);

export default router;
