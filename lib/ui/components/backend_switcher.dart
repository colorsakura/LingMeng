import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lingmeng/backend/providers.dart';
import 'package:lingmeng/providers/providers.dart';

class BackendSwitcher extends ConsumerWidget {
  const BackendSwitcher({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentBackend = ref.watch(currentBackendProvider);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: DropdownButtonFormField<BackendProvider>(
        initialValue: currentBackend,
        decoration: InputDecoration(
          labelText: 'AI 后端',
          border: const OutlineInputBorder(),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 12,
            vertical: 8,
          ),
        ),
        items: BackendProvider.values.map((provider) {
          return DropdownMenuItem(
            value: provider,
            child: Text(provider.displayName),
          );
        }).toList(),
        onChanged: (value) {
          if (value != null) {
            ref.read(currentBackendProvider.notifier).setBackend(value);
          }
        },
      ),
    );
  }
}
