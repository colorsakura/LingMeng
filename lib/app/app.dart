import 'package:flutter/material.dart';
import 'package:lingmeng/app/constants.dart';
import 'package:lingmeng/app/router.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: Constants.appName,
      theme: ThemeData(colorScheme: .fromSeed(seedColor: Colors.blue)),
      routerConfig: AppRouter.config,
    );
  }
}
