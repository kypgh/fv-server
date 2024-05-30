import RefreshTokenModel from "models/refreshToken";
import refreshTokenDashboardModel from "models/refreshTokenDashboard";

const refreshTokenService = {
  checkIfTokenExists: async (user) => {
    return RefreshTokenModel.findOne({
      user: user._id,
    }).select({
      user: user._id,
    });
  },
  checkIfTokenExistsDashbaord: async (crmUser) => {
    return refreshTokenDashboardModel
      .findOne({
        crmUser: crmUser._id,
      })
      .select({
        crmUser: crmUser._id,
      });
  },
  removeToken: async (token) => {
    return RefreshTokenModel.findByIdAndRemove(token._id.toString());
  },
  removeTokenDashboard: async (token) => {
    return refreshTokenDashboardModel.findByIdAndRemove(token._id.toString());
  },
  createRefreshToken: async (token) => {
    let refreshToken = new RefreshTokenModel(token);
    await refreshToken.save();
    return refreshToken;
  },
  createRefreshTokenDashboard: async (token) => {
    let refreshToken = new refreshTokenDashboardModel(token);
    await refreshToken.save();
    return refreshToken;
  },
  findToken: async (token) => {
    return RefreshTokenModel.findOne({ token });
  },
  findTokenDashboard: async (token) => {
    return refreshTokenDashboardModel.findOne({ token });
  },
};

export default refreshTokenService;
