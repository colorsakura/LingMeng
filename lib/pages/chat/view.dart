import 'package:fluentui_system_icons/fluentui_system_icons.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lingmeng/app/constants.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  Widget chatInputBox() {
    return Container(
      height: 100,
      color: Colors.grey,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              color: Colors.white,
              child: Column(
                children: [
                  TextField(
                    decoration: InputDecoration(
                      contentPadding: EdgeInsets.all(4.0),
                      border: InputBorder.none,
                      hintText: "发消息或按住说话...",
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(Constants.appName),
        actions: [
          IconButton(
            onPressed: () => context.go("/chat"),
            icon: Icon(FluentIcons.chat_add_24_regular),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(child: Container(color: Colors.grey)),
          chatInputBox(),
          Center(child: Text("内容由 AI 生成")),
        ],
      ),
    );
  }
}
