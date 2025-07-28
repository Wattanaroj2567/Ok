const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Book extends Model {
        static associate(models) {
            // Book มีได้หลาย Review
            this.hasMany(models.Review, {
                foreignKey: 'bookId',
                as: 'reviews',
                onDelete: 'CASCADE',
            });
        }
    }

    Book.init(
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            author: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
            },
            coverImage: {
                type: DataTypes.STRING,
                defaultValue: '/uploads/covers/default-book-cover.png',
            },
            publishedYear: {
                type: DataTypes.INTEGER,
            },
        },
        {
            sequelize,
            modelName: 'Book',
            timestamps: true,
        },
    );

    return Book;
};
