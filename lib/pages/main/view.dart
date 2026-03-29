import 'package:fluentui_system_icons/fluentui_system_icons.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lingmeng/app/constants.dart';
import 'package:lingmeng/ui/ui.dart' show SideBar;
import 'package:lingmeng/utils/platform.dart';

class MainPage extends StatelessWidget {
  const MainPage({super.key});

  @override
  Widget build(BuildContext context) {
    final body = PlatformUtils.isDesktop
        ? Row(children: [SideBar()])
        : Container();

    return Scaffold(
      appBar: PlatformUtils.isDesktop
          ? null
          : AppBar(
              title: Text(Constants.appName),
              actions: [
                IconButton(
                  onPressed: () => context.go("/chat"),
                  icon: Icon(FluentIcons.chat_add_24_regular),
                ),
              ],
            ),
      body: body,
      drawer: PlatformUtils.isDesktop
          ? null
          : Drawer(child: SafeArea(child: const Text("List"))),
    );
  }
}
