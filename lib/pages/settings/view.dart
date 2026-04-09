import 'package:fluentui_system_icons/fluentui_system_icons.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lingmeng/app/constants.dart';
import 'package:lingmeng/app/storage/token_storage.dart';
import 'package:lingmeng/backend/providers.dart';

class SettingsPage extends ConsumerStatefulWidget {
  const SettingsPage({super.key});

  @override
  ConsumerState<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends ConsumerState<SettingsPage> {
  final Map<BackendProvider, TextEditingController> _controllers = {};

  @override
  void initState() {
    super.initState();
    for (final provider in BackendProvider.values) {
      _controllers[provider] = TextEditingController(
        text: TokenStorage.getToken(provider) ?? '',
      );
    }
  }

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  void _saveToken(BackendProvider provider) {
    final token = _controllers[provider]!.text.trim();
    if (token.isNotEmpty) {
      TokenStorage.setToken(provider, token);
    } else {
      TokenStorage.clearToken(provider);
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${provider.displayName} Token 已保存')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('设置')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'API Token 配置',
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            '输入各平台的 API Token 以同步会话历史',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          ...BackendProvider.values.map((provider) {
            return Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          _getBackendIcon(provider),
                          size: 20,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          provider.displayName,
                          style: Theme.of(context).textTheme.titleSmall
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const Spacer(),
                        if (TokenStorage.hasToken(provider))
                          Chip(
                            label: const Text('已配置'),
                            backgroundColor: Colors.green.withOpacity(0.2),
                            labelStyle: const TextStyle(
                              color: Colors.green,
                              fontSize: 12,
                            ),
                          )
                        else
                          Chip(
                            label: const Text('未配置'),
                            backgroundColor: Colors.orange.withOpacity(0.2),
                            labelStyle: const TextStyle(
                              color: Colors.orange,
                              fontSize: 12,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _controllers[provider],
                      decoration: InputDecoration(
                        labelText: 'Bearer Token',
                        hintText: '输入 ${provider.displayName} 的 Bearer Token',
                        border: const OutlineInputBorder(),
                        suffixIcon: IconButton(
                          icon: const Icon(FluentIcons.save_24_regular),
                          onPressed: () => _saveToken(provider),
                          tooltip: '保存',
                        ),
                      ),
                      obscureText: true,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _getTokenHint(provider),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
          const Divider(),
          const SizedBox(height: 16),
          Text(
            '关于',
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Card(
            child: ListTile(
              leading: const Icon(FluentIcons.info_24_regular),
              title: Text(Constants.appName),
              subtitle: const Text('版本 1.0.0'),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getBackendIcon(BackendProvider provider) {
    switch (provider) {
      case BackendProvider.kimi:
        return FluentIcons.chat_24_filled;
      case BackendProvider.deepseek:
        return FluentIcons.brain_circuit_24_regular;
      case BackendProvider.doubao:
        return FluentIcons.sparkle_24_regular;
      case BackendProvider.qianwen:
        return FluentIcons.lightbulb_24_regular;
    }
  }

  String _getTokenHint(BackendProvider provider) {
    switch (provider) {
      case BackendProvider.kimi:
        return '从 Kimi 网页版开发者工具获取 Authorization header';
      case BackendProvider.deepseek:
        return '从 DeepSeek 网页版开发者工具获取 Authorization header';
      case BackendProvider.doubao:
        return '从豆包网页版开发者工具获取 Authorization header';
      case BackendProvider.qianwen:
        return '从通义千问网页版开发者工具获取 Authorization header';
    }
  }
}
