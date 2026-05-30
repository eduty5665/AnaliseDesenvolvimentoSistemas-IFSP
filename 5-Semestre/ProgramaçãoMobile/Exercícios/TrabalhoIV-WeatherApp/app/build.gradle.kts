plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "br.edu.ifsp.weatherapp"
    compileSdk = 36

    defaultConfig {
        applicationId = "br.edu.ifsp.weatherapp"
        minSdk = 28
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {
    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    
    // Retrofit & Gson
    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)
    
    // Glide para imagens
    implementation(libs.glide)
    annotationProcessor(libs.glide.compiler)

    // Localização
    implementation(libs.play.services.location)

    // Biblioteca de Gráficos
    implementation("com.github.PhilJay:MPAndroidChart:v3.1.0")

    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
}