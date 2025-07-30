import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

/** 아이템 생성 API **/
router.post("/items", async (req, res, next) => {
  try {
    const {
      item_code,
      item_name,
      item_price,
      item_stat,
      item_type,
      description,
      rarity,
    } = req.body;

    if (!item_code || !item_name) {
      return res
        .status(400)
        .json({ message: "item_code와 item_name은 필수 입력 항목입니다." });
    }

    const newItemData = {
      item_code: +item_code,
      item_name,
      item_price: item_price !== undefined ? +item_price : 1,
      item_stat: item_stat || {},
      item_type: item_type || "ETC",
      description: description || null,
      rarity: (rarity || "common").toLowerCase(),
    };

    const validRarities = ["common", "rare", "epic", "legendary"];

    if (!validRarities.includes(newItemData.rarity)) {
      return res
        .status(400)
        .json({
          message: `휘귀도는 다음중 하나여야 합니다:${validRarities.join(",")}`,
        });
    }

    const newItem = await prisma.items.create({
      data: newItemData,
    });

    return res
      .status(202)
      .json({ message: "아이템이 성공적으로 생성되었습니다.", data: newItem });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "이미 존재하는 item_code입니다." });
    }
    next(error);
  }
});

/** 아이템 목록 조회 API **/
router.get("/items", async (req, res, next) => {
  try {
    const items = await prisma.items.findMany({
      select: {
        item_code: true,
        item_name: true,
        item_price: true,
      },
      orderBy: {
        item_code: "asc", // 정렬은 필요에 따라 조절
      },
    });

    return res.status(200).json({ items });
  } catch (error) {
    console.error("아이템 목록 조회 에러:", error);
    return res
      .status(500)
      .json({ message: "아이템 목록 조회 중 서버 오류가 발생했습니다." });
  }
});

export default router;
