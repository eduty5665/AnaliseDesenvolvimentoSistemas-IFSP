#lista
#exemplo01
numbers = [10, 5, 7, 2, 1]
print("Os numeros ", numbers)
print()
numbers[0] = 111
print("Os numeros ", numbers)
print()
print(numbers[3])
print()
numbers[1] = numbers[4]
print("Os numeros ", numbers)

#exemplo02
my_list = [1, 3.20, true, "I am a string", 256, 0]
print(my_list)

#exemplo03
numbers = [10, 5, 7, 2, 1]
print("O numero ", numbers)
print("\n list lenght: ", len(numbers))

#exemplo04
numbers = [10, 5, 7, 2, 1]
print("O numero ", numbers)
del numbers[1]
print("O numero ", numbers)

#exemplo05
numbers = [10, 5, 7, 2, 1]
print("Os numeros ", numbers)
print()
numbers.append (4)
print("Os numeros ", numbers)
print()
numbers.insert (0, 222)
print("Os numeros ", numbers)
print()

#exemplo06
my_list = []
for i in range(5):
    my_list.append (i + 1)
print(my_list)

#exemplo07
total=0
my_list = []
for i in range(5):
    my_list.append (i + 1)
print(my_list)
for i in range(len(my_list)):
    total+=my_list[i]
print(total)

#exemplo08
list = [10, 1, 8, 3, 5]
total=0
for i in list:
    print(i)
    total+=i
print(total)
