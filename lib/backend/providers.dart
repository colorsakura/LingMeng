/// AI 后端提供商
enum BackendProvider {
  kimi('Kimi'),
  deepseek('DeepSeek'),
  doubao('Doubao'),
  qianwen('Qianwen');

  final String displayName;
  const BackendProvider(this.displayName);
}
