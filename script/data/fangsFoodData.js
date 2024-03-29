let projectDataList = [
    {
        Price: 300,
        MenuItemName: "梅花豬肉",
        Category: "meat",
    },
    {
        Price: 250,
        MenuItemName: "五花肉",
        Category: "meat",
    },
    {
        Price: 350,
        MenuItemName: "梅花牛肉",
        Category: "meat",
    },
    {
        Price: 300,
        MenuItemName: "五花牛",
        Category: "meat",
    },
    {
        Price: 450,
        MenuItemName: "澳洲和牛",
        Category: "meat",
    },
    {
        Price: 250,
        MenuItemName: "蝦",
        Category: "seafood",
    },
    {
        Price: 150,
        MenuItemName: "蛤蜊",
        Category: "seafood",
    },
    {
        Price: 400,
        MenuItemName: "石班魚肉",
        Category: "seafood",
    },
    {
        Price: 250,
        MenuItemName: "鱸魚肉",
        Category: "seafood",
    },
    {
        Price: 350,
        MenuItemName: "小卷",
        Category: "seafood",
    },
    {
        Price: 180,
        MenuItemName: "牡蠣",
        Category: "seafood",
    },
    {
        Price: 350,
        MenuItemName: "蟹腳肉",
        Category: "seafood",
    },
    {
        Price: 350,
        MenuItemName: "鱸魚肉",
        Category: "seafood",
    },
    {
        Price: 350,
        MenuItemName: "小捲",
        Category: "seafood",
    },
    {
        Price: 350,
        MenuItemName: "鱸魚肉",
        Category: "seafood",
    },
    {
        Price: 120,
        MenuItemName: "魚冊",
        Category: "seafood",
    },
    {
        Price: 120,
        MenuItemName: "魚餃",
        Category: "seafood",
    },
    {
        Price: 45,
        MenuItemName: "芋泥堡",
        Category: "seafood",
    },
    {
        Price: 50,
        MenuItemName: "蟹肉丸",
        Category: "seafood",
    },
    {
        Price: 45,
        MenuItemName: "芋泥包",
        Category: "dumplings",
    },
    {
        Price: 50,
        MenuItemName: "蟹肉丸",
        Category: "dumplings",
    },
    {
        Price: 40,
        MenuItemName: "三角豆腐",
        Category: "vegetable",
    },
    {
        Price: 80,
        MenuItemName: "蔬菜片",
        Category: "vegetable",
    },
    {
        Price: 80,
        MenuItemName: "三角蔬菜豆腐",
        Category: "vegetable",
    },
    {
        Price: 40,
        MenuItemName: "大甲芋頭",
        Category: "vegetable",
    },
    {
        Price: 100,
        MenuItemName: "牛肉丸",
        Category: "dumplings",
    },
    {
        Price: 45,
        MenuItemName: "鴨肉丸大顆",
        Category: "dumplings",
    },
    {
        Price: 45,
        MenuItemName: "芋角貢丸",
        Category: "dumplings",
    },
    {
        Price: 50,
        MenuItemName: "蔬菜豆腐正方形",
        Category: "vegetable",
    },
    {
        Price: 60,
        MenuItemName: "蛋餃",
        Category: "dumplings",
    },
    {
        Price: 50,
        MenuItemName: "花枝腸",
        Category: "dumplings",
    },
    {
        Price: 60,
        MenuItemName: "日本蝦球",
        Category: "dumplings",
    },
    {
        Price: 50,
        MenuItemName: "魚蛋腸",
        Category: "dumplings",
    },
    {
        Price: 50,
        MenuItemName: "北海章魚",
        Category: "seafood",
    },
    {
        Price: 60,
        MenuItemName: "魚卵蝦球",
        Category: "dumplings",
    },
    {
        Price: 110,
        MenuItemName: "帝王蟹棒",
        Category: "dumplings",
    },
    {
        Price: 50,
        MenuItemName: "炙燒起司",
        Category: "dumplings",
    },
    {
        Price: 50,
        MenuItemName: "月亮蝦餅",
        Category: "dumplings",
    },
    {
        Price: 60,
        MenuItemName: "明太子爆漿魚卵",
        Category: "dumplings",
    },
    {
        Price: 80,
        MenuItemName: "章魚條",
        Category: "seafood",
    },
    {
        Price: 85,
        MenuItemName: "日本干貝",
        Category: "seafood",
    },
    {
        Price: 50,
        MenuItemName: "南瓜包",
        Category: "dumplings",
    },
    {
        Price: 60,
        MenuItemName: "芝心包拉絲起司",
        Category: "dumplings",
    },
    {
        Price: 40,
        MenuItemName: "切花枝揚",
        Category: "dumplings",
    },
    {
        Price: 750,
        MenuItemName: "牛肉鍋",
        Category: "hotpot",
    },
    {
        Price: 650,
        MenuItemName: "豬肉鍋",
        Category: "hotpot",
    },
    {
        Price: 900,
        MenuItemName: "魚翅鍋",
        Category: "hotpot",
    },
    {
        Price: 70,
        MenuItemName: "草蝦丸",
        Category: "dumplings",
    },
    {
        Price: 60,
        MenuItemName: "芝心包（拉絲起司)",
        Category: "dumplings",
    },
    {
        Price: 50,
        MenuItemName: "南瓜堡",
        Category: "dumplings",
    },
    {
        Price: 60,
        MenuItemName: "明太子（爆漿魚卵）",
        Category: "dumplings",
    },
    {
        Price: 50,
        MenuItemName: "月亮蝦餅",
        Category: "dumplings",
    },
    {
        Price: 50,
        MenuItemName: "炙燒（起司）",
        Category: "dumplings",
    },
    {
        Price: 258,
        MenuItemName: "龍膽石斑魚",
        Category: "dumplings",
    },
    {
        Price: 300,
        MenuItemName: "白蝦大隻5隻",
        Category: "dumplings",
    },
    {
        Price: 350,
        MenuItemName: "白蝦小隻",
        Category: "dumplings",
    },
    {
        Price: 250,
        MenuItemName: "干貝",
        Category: "dumplings",
    },
    {
        Price: 600,
        MenuItemName: "魚翅",
        Category: "dumplings",
    },
    {
        Price: 158,
        MenuItemName: "蟹肉",
        Category: "dumplings",
    },
    {
        Price: 238,
        MenuItemName: "美國牛梅花小100克",
        Category: "dumplings",
    },
    {
        Price: 450,
        MenuItemName: "美國牛梅花大200克",
        Category: "dumplings",
    },
    {
        Price: 238,
        MenuItemName: "美國牛板腱小100克",
        Category: "dumplings",
    },
    {
        Price: 450,
        MenuItemName: "美國牛板腱大200克",
        Category: "dumplings",
    },
    {
        Price: 396,
        MenuItemName: "美國安格斯黑牛肩小排小100克",
        Category: "dumplings",
    },
    {
        Price: 760,
        MenuItemName: "美國安格斯黑牛肩小排大200克",
        Category: "dumplings",
    },
    {
        Price: 312,
        MenuItemName: "美國牛五花100克",
        Category: "dumplings",
    },
    {
        Price: 590,
        MenuItemName: "美國牛五花大200克",
        Category: "dumplings",
    },
    {
        Price: 336,
        MenuItemName: "松板豬肉片100克",
        Category: "dumplings",
    },
    {
        Price: 638,
        MenuItemName: "松板豬肉片大200克",
        Category: "dumplings",
    },
    {
        Price: 150,
        MenuItemName: "豬梅花肉100克",
        Category: "dumplings",
    },
    {
        Price: 270,
        MenuItemName: "豬梅花肉大200克",
        Category: "dumplings",
    }
];

module.exports = projectDataList;