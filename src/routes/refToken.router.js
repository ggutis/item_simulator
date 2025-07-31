import express from 'express';
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

router.post("/token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh Token이 없습니다." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
    const savedToken = await prisma.refreshToken.findUnique({
      where: { accountId: decoded.accountId },
    });

    if (!savedToken || savedToken.token !== refreshToken) {
      return res.status(403).json({ message: "유효하지 않은 Refresh Token입니다." });
    }

    const newAccessToken = jwt.sign(
      { accountId: decoded.accountId },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: "15m" }
    );

    res.cookie('authorization', `Bearer ${newAccessToken}`);
    return res.status(200).json({ message: '토큰이 성공적으로 재발급 되었습니다.' });
  } catch (err) {
    return res.status(403).json({ message: "Refresh Token이 유효하지 않거나 만료되었습니다." });
  }
});

export default router;
