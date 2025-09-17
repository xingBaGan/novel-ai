import { chineseEnglishWordCounter } from "../wordCounter";

describe("chineseEnglishWordCounter", () => {
  describe("Empty and null inputs", () => {
    it("should return 0 for empty string", () => {
      expect(chineseEnglishWordCounter("")).toBe(0);
    });

    it("should return 0 for whitespace only", () => {
      expect(chineseEnglishWordCounter("   ")).toBe(0);
      expect(chineseEnglishWordCounter("\t\n")).toBe(0);
    });

    it("should return 0 for null input", () => {
      expect(chineseEnglishWordCounter(null as any)).toBe(0);
    });

    it("should return 0 for undefined input", () => {
      expect(chineseEnglishWordCounter(undefined as any)).toBe(0);
    });
  });

  describe("Chinese character counting", () => {
    it("should count individual Chinese characters", () => {
      expect(chineseEnglishWordCounter("你好")).toBe(2);
      expect(chineseEnglishWordCounter("世界")).toBe(2);
      expect(chineseEnglishWordCounter("测试")).toBe(2);
    });

    it("should count multiple Chinese characters", () => {
      expect(chineseEnglishWordCounter("你好世界")).toBe(4);
      expect(chineseEnglishWordCounter("这是一个测试")).toBe(6);
    });

    it("should count Chinese characters with punctuation", () => {
      expect(chineseEnglishWordCounter("你好，世界！")).toBe(4);
      expect(chineseEnglishWordCounter("测试：功能正常")).toBe(6);
    });
  });

  describe("English word counting", () => {
    it("should count individual English words", () => {
      expect(chineseEnglishWordCounter("hello")).toBe(1);
      expect(chineseEnglishWordCounter("world")).toBe(1);
      expect(chineseEnglishWordCounter("test")).toBe(1);
    });

    it("should count multiple English words", () => {
      expect(chineseEnglishWordCounter("hello world")).toBe(2);
      expect(chineseEnglishWordCounter("this is a test")).toBe(4);
    });

    it("should count English words with punctuation", () => {
      expect(chineseEnglishWordCounter("hello, world!")).toBe(2);
      expect(chineseEnglishWordCounter("test: function works")).toBe(3);
    });

    it("should handle various whitespace characters", () => {
      expect(chineseEnglishWordCounter("hello\tworld")).toBe(2);
      expect(chineseEnglishWordCounter("hello\nworld")).toBe(2);
      expect(chineseEnglishWordCounter("hello  world")).toBe(2);
    });
  });

  describe("Mixed Chinese and English text", () => {
    it("should count both Chinese characters and English words", () => {
      expect(chineseEnglishWordCounter("hello 你好")).toBe(3); // 1 English word + 2 Chinese chars
      expect(chineseEnglishWordCounter("测试 test 功能")).toBe(5); // 4 Chinese chars + 1 English word
    });

    it("should handle complex mixed text", () => {
      expect(chineseEnglishWordCounter("这是一个test，用于测试function")).toBe(10); // 6 Chinese chars + 2 English words
    });
  });

  describe("HTML tag handling", () => {
    it("should remove HTML tags before counting", () => {
      expect(chineseEnglishWordCounter("<p>hello world</p>")).toBe(2);
      expect(chineseEnglishWordCounter("<div>你好世界</div>")).toBe(4);
      expect(chineseEnglishWordCounter("<span>test 测试</span>")).toBe(3);
    });

    it("should handle nested HTML tags", () => {
      expect(chineseEnglishWordCounter("<div><p>hello <strong>world</strong></p></div>")).toBe(2);
    });

    it("should handle self-closing HTML tags", () => {
      expect(chineseEnglishWordCounter("hello<br/>world")).toBe(2);
      expect(chineseEnglishWordCounter("测试<hr>功能")).toBe(4);
    });
  });

  describe("Edge cases", () => {
    it("should handle numbers and special characters", () => {
      expect(chineseEnglishWordCounter("hello123")).toBe(1);
      expect(chineseEnglishWordCounter("test@#$%")).toBe(1);
      expect(chineseEnglishWordCounter("123456")).toBe(0); // No letters, should be 0
    });

    it("should handle mixed scripts with numbers", () => {
      expect(chineseEnglishWordCounter("测试123功能")).toBe(4); // Only Chinese chars counted
      expect(chineseEnglishWordCounter("hello123world")).toBe(1); // Only English words counted
    });

    it("should handle very long text", () => {
      const longText = "一个很长的测试文本".repeat(100) + " hello world ".repeat(50);
      const expectedCount = 9 * 100 + 2 * 50; // 8 Chinese chars * 100 + 2 English words * 50
      expect(chineseEnglishWordCounter(longText)).toBe(expectedCount);
    });

    it("should handle text with only punctuation", () => {
      expect(chineseEnglishWordCounter("!@#$%^&*()")).toBe(0);
      expect(chineseEnglishWordCounter("，。！？；：")).toBe(0);
    });
  });

  describe("Unicode handling", () => {
    it("should handle full-width characters", () => {
      expect(chineseEnglishWordCounter("Ｈｅｌｌｏ　Ｗｏｒｌｄ")).toBe(0); // Full-width English not counted as English words
      expect(chineseEnglishWordCounter("你好　世界")).toBe(4); // Full-width space handled correctly
    });

    it("should handle various Unicode spaces", () => {
      expect(chineseEnglishWordCounter("hello\u00a0world")).toBe(2); // Non-breaking space
      expect(chineseEnglishWordCounter("hello\u3000world")).toBe(2); // Ideographic space
    });
  });
});
