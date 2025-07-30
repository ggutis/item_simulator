import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/** 사용자 회원가입 API **/
router.post("/sign-up", async (req, res, next) => {
  try {
    const { userId, password, confirmPassword } = req.body;
    const userIdRegex = /^[a-z0-9]+$/;
    const isExisAccount = await prisma.accounts.findFirst({
      where: {
        userId,
      },
    });

    if (!userIdRegex.test(userId)) {
      return res
        .status(400)
        .json({ message: "아이디는 영어 소문자와 숫자만 사용할 수 있습니다." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "비밀번호는 최소 6자 이상이어야 합니다." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    if (isExisAccount) {
      return res.status(409).json({ message: "이미 존재하는 계정입니다." });
    }

    // 사용자 비밀번호를 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // account 테이블에 계정 추가
    await prisma.accounts.create({
      data: {
        userId,
        password: hashedPassword,
      },
      select: {
        accountId: true,
        userId: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (err) {
    next(err);
  }
});

/** 로그인 API **/
router.post("/sign-in", async (req, res, next) => {
  try {
    const { userId, password } = req.body;
    const user = await prisma.accounts.findFirst({ where: { userId } });

    if (!user)
      return res.status(401).json({ message: "존재하지 않는 계정입니다." });
    // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
    else if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

    // 로그인에 성공하면, 사용자의 userId를 바탕으로 세션을 생성합니다.
    req.session.userId = user.userId;

    return res.status(200).json({ message: "로그인 성공" });
  } catch (err) {
    next(err);
  }
});

/** 계정 조회(관리자용) API **/

router.get("/account/", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;

  const account = await prisma.accounts.findUnique({
    where: { userId: userId },
    select: {
      accountId:true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      characters: true,
    },
  });

  return res.status(200).json({ data: account });
});

export default router;
