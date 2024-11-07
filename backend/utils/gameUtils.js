// backend/utils/gameUtils.js

const { redisClient } = require("../config/db");
const {
  updateTrashPositions,
  getTrashPositions,
  updateObstaclePositions,
  getObstaclePositions,
  updateItemPositions,
  getItemPositions,
} = require("./redisHandler");
const { v4: uuidv4 } = require("uuid");
// 이거 고유id를 부여하는 방법 중 하나라, 좀 더 편한 대체 방안 있으면 수정해도 좋아요!
// Mongoose 모델 임포트
const Item = require("../models/item");
const Trash = require("../models/trash");
const Obstacle = require("../models/obstacle");

// 유저의 보유 쓰레기량 조회 함수
exports.getUserTrashData = async (userId) => {
  const trashAmount = await redisClient.hGet("user_trash", userId);
  return { userId, trashAmount: parseInt(trashAmount) || 0 };
};

// 랜덤 위치 생성 함수 (좌표 제한 적용)
// 활용도 높아서 같은 파일 내 다른 함수들도 이 유틸 참조합니다 :)
const generateRandomPosition = () => {
  return {
    x: Math.floor(Math.random() * 1280), // x 범위: 0 < x < 1280
    y: Math.floor(Math.random() * 500), // y 범위: 0 < y < 500
  };
};

// 쓰레기 생성 함수
exports.generateTrash = async () => {
  // 데이터베이스에서 총 쓰레기 개수 가져오기
  const trashCount = await Trash.countDocuments();

  if (trashCount === 0) {
    throw new Error("데이터베이스에 쓰레기가 없습니다.");
  }

  // 랜덤 인덱스 생성
  const randomIndex = Math.floor(Math.random() * trashCount);

  // 랜덤한 쓰레기 아이템 가져오기
  const randomTrash = await Trash.findOne().skip(randomIndex).exec();

  const objectId = uuidv4();
  const trashId = randomTrash.trashId; // Trash 모델의 trashId 필드 사용
  const position = generateRandomPosition();

  // Redis에 업데이트
  await updateTrashPositions(objectId, trashId, position);

  // 업데이트된 전체 쓰레기 데이터 가져오기
  const trashList = await getTrashPositions();
  return trashList;
};

// 방해요소 생성 함수
exports.generateObstacle = async () => {
  // 데이터베이스에서 총 방해요소 개수 가져오기
  const obstacleCount = await Obstacle.countDocuments();

  if (obstacleCount === 0) {
    throw new Error("데이터베이스에 방해요소가 없습니다.");
  }

  // 랜덤 인덱스 생성
  const randomIndex = Math.floor(Math.random() * obstacleCount);

  // 랜덤한 방해요소 가져오기
  const randomObstacle = await Obstacle.findOne().skip(randomIndex).exec();

  const objectId = uuidv4();
  const obstacleId = randomObstacle.obstacleId; // Obstacle 모델의 obstacleId 필드 사용
  const position = generateRandomPosition();

  // Redis에 저장
  await updateObstaclePositions(objectId, obstacleId, position);

  // 업데이트된 전체 방해요소 데이터 가져오기
  const obstacleList = await getObstaclePositions();
  return obstacleList;
};

// 아이템 생성 함수
exports.generateItem = async () => {
  // 데이터베이스에서 총 아이템 개수 가져오기
  const itemCount = await Item.countDocuments();

  if (itemCount === 0) {
    throw new Error("데이터베이스에 아이템이 없습니다.");
  }

  // 랜덤 인덱스 생성
  const randomIndex = Math.floor(Math.random() * itemCount);

  // 랜덤한 아이템 가져오기
  const randomItem = await Item.findOne().skip(randomIndex).exec();

  const objectId = uuidv4();
  const itemId = randomItem.itemId; // Item 모델의 itemId 필드 사용
  const position = generateRandomPosition();

  // Redis에 업데이트
  await updateItemPositions(objectId, itemId, position);

  // 업데이트된 전체 아이템 데이터 가져오기
  const itemList = await getItemPositions();
  return itemList;
};
