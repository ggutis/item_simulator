import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/characters", authMiddleware, async (req, res) => {
  try {
    const { charactername } = req.body;
    const { accountId } = req.user; // authMiddleware에서 넣어준 로그인 계정 ID

    // 1. 캐릭터 이름 중복여부 검증
    const isExisCharacter = await prisma.character.findFirst({
      where: { charactername },
    });

    if (isExisCharacter) {
      return res
        .status(409)
        .json({ message: "이미 존재하는 캐릭터 이름입니다." });
    }

    // 2. 현재 계정의 캐릭터 수 조회
    const characterCount = await prisma.character.count({
      where: { accountId },
    });

    const MAX_CHARACTERS = 3; // 생성 가능 최대 캐릭터 수

    if (characterCount >= MAX_CHARACTERS) {
      return res.status(400).json({
        message: `캐릭터 생성 한도 초과: 최대 ${MAX_CHARACTERS}개까지 생성 가능합니다.`,
      });
    } else if (!charactername) {
      return res.status(400).json({ message: "캐릭터 이름을 입력해주세요." });
    }

    // 3. 캐릭터 생성
    const newCharacter = await prisma.character.create({
      data: {
        charactername,
        accountId,
    },
        select: {
          characterId: true,
          charactername: true,
          health: true,
          power: true,
          money: true,
          createdAt: true,
        },
    });

    return res
      .status(201)
      .json({ message: "캐릭터 생성 완료", data: newCharacter });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "캐릭터 생성 중 오류 발생" });
  }
});

export default router;
