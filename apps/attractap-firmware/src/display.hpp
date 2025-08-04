#pragma once

#include <Arduino.h>
#include <Adafruit_GFX.h>
#ifdef SCREEN_DRIVER_SH1106
#include <Adafruit_SH1106.h>
#include "icons.hpp"
#include "leds.hpp"

#elif SCREEN_DRIVER_SSD1306
#include <Adafruit_SSD1306.h>
#elif
#error "No display driver defined"
#endif
#include "configuration.hpp"

class Display
{
public:
#ifdef SCREEN_DRIVER_SH1106
    Display(Leds *leds) : display(SCREEN_RESET), leds(leds) {}
#elif SCREEN_DRIVER_SSD1306
    Display(Leds *leds) : display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, SCREEN_RESET), leds(leds) {}
#endif

    enum DisplayState
    {
        DISPLAY_STATE_NONE,
        DISPLAY_STATE_ERROR,
        DISPLAY_STATE_SUCCESS,
        DISPLAY_STATE_TEXT,
        DISPLAY_STATE_CARD_CHECKING
    };

    ~Display() {}

    void setup();
    void loop();

    void set_nfc_tap_enabled(bool enabled, String text);
    void set_nfc_tap_enabled(bool enabled);
    void set_network_connected(bool connected);
    void set_api_connected(bool connected);
    void set_ip_address(IPAddress ip);
    void set_device_name(String name);
    void show_error(String error);
    void clear_error();
    void show_success(String success);
    void clear_success();
    void show_text(String lineOne, String lineTwo);
    void clear_text();

private:
#ifdef SCREEN_DRIVER_SH1106
    Adafruit_SH1106 display;
#elif SCREEN_DRIVER_SSD1306
    Adafruit_SSD1306 display;
#endif

    unsigned long boot_time = 0;

    DisplayState display_state = DISPLAY_STATE_NONE;

    Leds *leds;
    bool is_network_connected = false;
    bool is_api_connected = false;
    String nfc_tap_text = "-- no text --";
    IPAddress ip_address;
    String device_name = "-";
    String error = "";
    String success = "";
    String text_line_one = "";
    String text_line_two = "";

    void draw_main_elements();
    void draw_nfc_tap_ui();
    void draw_network_connecting_ui();
    void draw_api_connecting_ui();
    void draw_error_ui();
    void draw_success_ui();
    void draw_text_ui();

    void draw_two_line_message(String line1, String line2);
};