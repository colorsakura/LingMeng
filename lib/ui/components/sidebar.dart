import 'package:flutter/material.dart';

// 桌面端的侧边栏
class SideBar extends StatefulWidget {
  const SideBar({super.key});

  @override
  State<SideBar> createState() => _SideBarState();
}

class _SideBarState extends State<SideBar> {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: double.infinity,
      color: Colors.white60,
      child: Column(children: [Text("Hello Flutter!")]),
    );
  }
}
